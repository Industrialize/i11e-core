'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var applyChange = require('deep-diff').applyChange;
var createError = require('./utils').createError;
var extend = require('extend');
var _diff = require('deep-diff').diff;
var isStream = require('isstream');
var objectPath = require("object-path");

var seq = require('./Sequence');

var G = require('./Global');
var Constants = require('./Constants');

/**
 * Box class
 */

var Box = function () {
  /**
   * constructor
   * @param  {Object} content box content
   * @param  {Object} tags    =             {} tags on box
   * @return {Box}         Box instance
   */

  function Box(content) {
    var tags = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Box);

    this.__type__ = 'box';
    this._seq = seq.new();
    this._error = null;
    this._payload = content;
    this._tags = tags;
    this._results = null; // the results of a request

    if (Box.isBox(content)) {
      // content is already a box, copy all
      for (var key in content) {
        if (_typeof(content[key]) === 'object' && key != '_payload') {
          if (!this.hasOwnProperty(key)) this[key] = {};
          extend(true, this[key], content[key]);
        } else {
          this[key] = content[key];
        }
      }
    } else if (content instanceof Error) {
      this._error = content;
    } else if ((typeof content === 'undefined' ? 'undefined' : _typeof(content)) == 'object' && !Buffer.isBuffer(content) && !isStream(content)) {
      // copy the _payload content to the box
      for (var _key in content) {
        if (content.hasOwnProperty(_key)) {
          if (_typeof(content[_key]) === 'object') {
            if (!this.hasOwnProperty(_key)) this[_key] = {};
            extend(true, this[_key], content[_key]);
          } else {
            this[_key] = content[_key];
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


  _createClass(Box, [{
    key: 'payload',


    // ---------------------------------------------------------------------------
    // Instance Methods
    // ---------------------------------------------------------------------------

    /**
     * Get the raw payload
     * @return {Object | primitive type} box payload
     */
    value: function payload() {
      return this._payload;
    }

    /**
     * Set content to a given path
     * @param {Array | String} path  the data path
     * @param {Object} value the object to be put in box
     * @return {Box} box itself
     */

  }, {
    key: 'set',
    value: function set(path, value) {
      objectPath.set(this, this.pathMap(path), value);
      return this;
    }

    /**
     * Get the object form the given path
     * @param  {Array | string} path the data path
     * @return {Object}      object stored in path
     */

  }, {
    key: 'get',
    value: function get(path) {
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

  }, {
    key: 'has',
    value: function has(path) {
      return objectPath.has(this, this.pathMap(path));
    }

    /**
     * Delete the data in data path
     * @param  {Array | string} path the data path
     * @return {Box}      Box itself
     */

  }, {
    key: 'del',
    value: function del(path) {
      if (objectPath.has(this, this.pathMap(path))) {
        objectPath.del(this, this.pathMap(path));
      }
      return this;
    }
  }, {
    key: 'pathMap',
    value: function pathMap(path) {
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

      if (G.debug && G.glossary && this._debug) {
        console.log('  | Path [', keys.join('.'), '] maps to [', newPath.join('.'), ']');
      }


      return newPath.join('.');
    }

    /**
     * Add a tag to the box
     * @param {String} name tag name
     * @param {Object} tag  tag obejct
     */

  }, {
    key: 'addTag',
    value: function addTag(name, tag) {
      this._tags[name] = tag;
      return this;
    }

    /**
     * Get the tag from its name
     * @param  {String} name the tag name
     * @return {Object}      the tag object
     */

  }, {
    key: 'getTag',
    value: function getTag(name) {
      return this._tags.hasOwnProperty(name) ? this._tags[name] : null;
    }

    /**
     * Remove tag
     * @param  {String} name tag name
     * @return {Box}      Box itself
     */

  }, {
    key: 'removeTag',
    value: function removeTag(name) {
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

  }, {
    key: 'diff',
    value: function diff(box) {
      return _diff(this, box);
    }

    /**
     * Merge the current box with given box
     * @param  {Box} box the box to merge
     * @return {Box}     the current box after merge
     */

  }, {
    key: 'merge',
    value: function merge(box) {
      var ds = _diff(this, box);
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

  }, {
    key: 'union',
    value: function union(box) {
      return this;
    }

    /**
     * Get box id
     * @return {String} box id
     */

  }, {
    key: 'getId',
    value: function getId() {
      return this._seq;
    }

    /**
     * Get the notify tag
     * @return {Boolean} true if notify or false if request
     */

  }, {
    key: 'getNotifyTag',
    value: function getNotifyTag() {
      return !!this.getTag(Constants.tags.NOTIFY);
    }

    /**
     * Set the notify tag
     * @param {Boolean} tag notify (true) or request (false)
     */

  }, {
    key: 'setNotifyTag',
    value: function setNotifyTag(tag) {
      return !!tag ? this.addTag(Constants.tags.NOTIFY, true) : this.removeTag(Constants.tags.NOTIFY);
    }

    /**
     * Get the glossary
     * @return {Map} glossary map
     */

  }, {
    key: 'getGlossaryTag',
    value: function getGlossaryTag() {
      return this.getTag(Constants.tags.GLOSSARY);
    }

    /**
     * Set the glossary
     * @param {Map} tag the glossary
     */

  }, {
    key: 'setGlossaryTag',
    value: function setGlossaryTag(tag) {
      return !!tag ? this.addTag(Constants.tags.GLOSSARY, tag) : this.removeTag(Constants.tags.GLOSSARY);
    }
  }, {
    key: 'print',
    value: function print(showHidden) {
      if (showHidden) {
        console.log(JSON.stringify(this, null, 2));
      }

      var newBox = new Box(this);
      for (var key in newBox) {
        if (key.indexOf('_') == 0) {
          delete newBox[key];
        }
      }

      console.log(JSON.stringify(newBox, null, 2));
    }
  }], [{
    key: 'isBox',
    value: function isBox(object) {
      return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object !== null && object.__type__ == 'box';
    }

    /**
     * Create a new Box with the same sequence
     * @param  {Object} content new box's content
     * @param  {Object} tags    box tags
     * @return {Object}         Box instance
     */

  }, {
    key: 'new',
    value: function _new(content, tags) {
      var newBox = new Box(content, tags);
      newBox._seq = this._seq;
      return newBox;
    }
  }]);

  return Box;
}();

module.exports = Box;