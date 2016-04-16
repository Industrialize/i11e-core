const applyChange = require('deep-diff').applyChange;
const createError = require('./utils').createError;
const extend = require('extend');
const diff = require('deep-diff').diff;
const isStream = require('isstream');
const objectPath = require("object-path");

const seq = require('./Sequence');

const G = require('./Global');
const Constants = require('./Constants');

/**
 * Box class
 */
class Box {
  /**
   * constructor
   * @param  {Object} content box content
   * @param  {Object} tags    =             {} tags on box
   * @return {Box}         Box instance
   */
  constructor(content, tags = {}) {
    this.__type__ = 'box';
    this._seq = seq.new();
    this._error = null;
    this._payload = content;
    this._tags = tags;
    this._results = null; // the results of a request

    if (Box.isBox(content)) {
      // content is already a box, copy all
      for (let key in content) {
        if (typeof content[key] === 'object' && key != '_payload') {
          if (!this.hasOwnProperty(key)) this[key] = {};
          extend(true, this[key], content[key]);
        } else {
          this[key] = content[key];
        }
      }
    } else if (content instanceof Error) {
      this._error = content;
    } else if (typeof content == 'object' && !Buffer.isBuffer(content) && !isStream(content)) {
      // copy the _payload content to the box
      for (let key in content) {
        if (content.hasOwnProperty(key)) {
          if (typeof content[key] === 'object') {
            if (!this.hasOwnProperty(key)) this[key] = {};
            extend(true, this[key], content[key]);
          } else {
            this[key] = content[key];
          }

        }
      }
    } else {
      // create a box with primitive type, stream, and buffer payload
      this._payload = content;
    }
  }

  // ---------------------------------------------------------------------------
  // Static Methods
  // ---------------------------------------------------------------------------
  /**
   * Check if the object is a Box
   * @param  {Object}  object the object to detect
   * @return {Boolean}        true if it is a Box otherwise false
   */
  static isBox(object) {
    return typeof object === 'object' && object !== null && object.__type__ == 'box';
  }

  // ---------------------------------------------------------------------------
  // Instance Methods
  // ---------------------------------------------------------------------------

  /**
   * Create a new Box with the same sequence
   * @param  {Object} content new box's content
   * @param  {Object} tags    box tags
   * @return {Object}         Box instance
   */
  new(content, tags) {
    var newBox = new Box(content, tags);
    newBox._seq = this._seq;
    return newBox;
  }

  /**
   * Get the raw payload
   * @return {Object | primitive type} box payload
   */
  payload() {
    return this._payload;
  }

  /**
   * Set content to a given path
   * @param {Array | String} path  the data path
   * @param {Object} value the object to be put in box
   * @return {Box} box itself
   */
  set(path, value) {
    objectPath.set(this, this.pathMap(path), value);
    return this;
  }

  /**
   * Get the object form the given path
   * @param  {Array | string} path the data path
   * @return {Object}      object stored in path
   */
  get(path) {
    if (!path) {
      throw createError(500, 'Could not access path [null | undefined] in Box');
    }
    return objectPath.get(this, this.pathMap(path));
  }

  /**
   * Check if a data path exists or not
   * @param  {Array | string}  path the data path
   * @return {Boolean}      true if data path exists otherwise false
   */
  has(path) {
    let v = objectPath.get(this, this.pathMap(path));
    return !!v && v != false;
  }

  /**
   * Delete the data in data path
   * @param  {Array | string} path the data path
   * @return {Box}      Box itself
   */
  del(path) {
    if (objectPath.has(this, this.pathMap(path))) {
      objectPath.del(this, this.pathMap(path));
    }
    return this;
  }

  pathMap(path) {
    var keys = path;
    if (!Array.isArray(path)) {
      keys = path.split('.');
    }

    var newPath = [];
    var glossary = this.getGlossaryTag();
    for (var i = 0; i < keys.length; i++) {
      var newKeys = keys.slice(0, i + 1).join('.');
      if (!glossary || !glossary.hasOwnProperty(newKeys)) {
        newPath.push(keys[i]);
      } else {
        newPath.push(glossary[keys[i]]);
      }
    }

"#if process.env.NODE_ENV !== 'production'";
    if ((G.debug && G.glossary) || this.getTag(Constants.tags.DEBUG_GLOSSARY)) {
      console.log('  | Path [', keys.join('.'), '] maps to [', newPath.join('.'), ']');
    }
"#endif";

    return newPath.join('.');
  }

  /**
   * Add a tag to the box
   * @param {String} name tag name
   * @param {Object} tag  tag obejct
   */
  addTag(name, tag) {
    if (name === Constants.tags.GLOSSARY) {
      let glossary = this.getGlossaryTag();
      if (!glossary) {
        this._tags[name] = tag;
      } else {
        for (let word in tag) {
          if (glossary.hasOwnProperty(tag[word])) {
            tag[word] = glossary[tag[word]];
          }
        }
        this._tags[name] = tag;
      }
    } else {
      this._tags[name] = tag;
    }
    return this;
  }

  /**
   * Check if a tag exists
   * @param  {String}  name the tag name
   * @return {Boolean}      true if tag exist otherwise false
   */
  hasTag(name) {
    if (this._tags.hasOwnProperty(name)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Get the tag from its name
   * @param  {String} name the tag name
   * @return {Object}      the tag object
   */
  getTag(name) {
    return this._tags.hasOwnProperty(name) ? this._tags[name] : null;
  }

  /**
   * Remove tag
   * @param  {String} name tag name
   * @return {Box}      Box itself
   */
  removeTag(name) {
    if (this._tags.hasOwnProperty(name)) {
      delete this._tags[name];
    }
    return this;
  }

  /**
   * Calculates the diff from the current box
   * @param  {Box} box the box to compare with
   * @return {Array}     The diffs
   */
  diff(box) {
    return diff(this, box);
  }

  /**
   * Merge the current box with given box
   * @param  {Box} box the box to merge
   * @return {Box}     the current box after merge
   */
  merge(box) {
    var ds = diff(this, box);
    if (ds) {
      for (var i = 0; i < ds.length; i++) {
        if (ds[i].kind === 'D') {
          //skip delete
          continue;
        }

        if (ds[i].kind === 'E') {
          // update
        }

        applyChange(this, box, ds[i]);
      }
    }
    return this;
  }

  /**
   * Calculate the union of boxes
   * @param  {Box} box the box to calculate the union
   * @return {Box}     the current box after union
   */
  union(box) {
    return this;
  }

  /**
   * Get box id
   * @return {String} box id
   */
  getId() {
    let id = this.getTag(Constants.tags.ID);
    if (id) return id;
    return this._seq;
  }

  /**
   * Get the notify tag
   * @return {Boolean} true if notify or false if request
   */
  getNotifyTag() {
    return !!this.getTag(Constants.tags.NOTIFY);
  }

  /**
   * Set the notify tag
   * @param {Boolean} tag notify (true) or request (false)
   */
  setNotifyTag(tag) {
    return !!tag ? this.addTag(Constants.tags.NOTIFY, true) : this.removeTag(Constants.tags.NOTIFY);
  }

  /**
   * Get the glossary
   * @return {Map} glossary map
   */
  getGlossaryTag() {
    return this.getTag(Constants.tags.GLOSSARY);
  }

  /**
   * Set the glossary
   * @param {Map} tag the glossary
   */
  setGlossaryTag(tag) {
    if (!tag) {
      return this.removeTag(Constants.tag.GLOSSARY);
    } else {
      return this.addTag(Constants.tags.GLOSSARY, tag);
    }
  }

  print(showHidden, showTag) {
    var newBox = new Box(this);
    let filter = this.getTag(Constants.tags.DEBUG_UNBOX_FILER);
    if (filter) filter = filter.split(';');
    for (var key in newBox) {
      if (!showHidden) {
        if (key.indexOf('_') == 0) {
          delete newBox[key];
        }
      }

      if (filter) {
        if (filter.indexOf(key) < 0) {
          delete newBox[key];
        }
      }
    }
    console.log('--- Content ---');
    if (filter) console.log('(filter:', filter)
    console.log(JSON.stringify(newBox, null, 2));

    if (showTag) {
      console.log('--- Tags ---');
      console.log(JSON.stringify(this._tags || {}, null, 2));
    }

    return this;
  }
}

module.exports = Box;
