const createRobotModel = require('../Robot');
var createError = require('../utils').createError;

/**
 * A robot used to check the content of the box to determine if the box is valid
 * to process
 *
 * It accepts a checkpoint table as parameter, see production line's checkpoint
 * function for more details
 *
 * Example:
 *
 * var boxValidationRobot = new BoxValidationRobot({
 * 	'cmd=': 'user.register',
 * 	'name&': 'name could not be null, and must be a string',
 * 	'email&': 'must be a string',
 * 	'password': function(box, v) {  // make sure password has uppercase char and number
 * 		if (typeof v !== 'string') return false;
 * 		var hasUpperCase = false;
 * 		var hasNumber = false;
 * 		for (let i = 0; i < v.length; i++) {
 *   		if (v.charat(i) == v.charat(i).toUpperCase()) hasUpperCase = true;
 *   		if (!isNaN(v.charat(i), 10)) hasNumber = true;
 * 		}
 *
 * 		return hasUpperCase && hasNumber;
 * 	}
 * })
 */
module.exports = createRobotModel({
  initRobot() {
    this.template = this.options;
  },

  getModel() {
    return 'BoxValidationRobot';
  },

  process(box, done) {
    if (typeof this.template === 'function') {
      return this.handleFunction(box, done);
    }

    try {
      this.check(box, this.template, []);
      done(null, box);
    } catch (err) {
      done(createError(500, err, box));
    }
  },

  handleFunction(box, done) {
    var fn = this.template;

    try {
      if (!fn(box)) {
        throw new Error(`Checkpoint faied!`);
      }
      done(null, box);
    } catch (error) {
      var newError = createError(400, error, box);
      done(newError);
    }
  },

  parseKey(key) {
    var parts = key.split(':');
    if (parts.length == 1) {
      return [
        {
          key: key,
          op: '='
        }
      ]
    }

    var ops = parts.splice(-1, 1);
    var field = parts.join(':');
    var ret = [];
    for (var i = 0; i < ops.length; i++) {
      var op = ops.charAt(i);

      if (op != '!' // not null
        && op != '=' // equal
        && op != '#' // deep equal, recuisively check the children
        && op != '&' // check type
        && op != '-' // do not check
        && op != '^') { // must be null or undefined

        op = '=';
      }

      ret.push({
        key: field,
        op: op
      })
    }

    return ret;
  },

  check(box, template, rootPath) {
    var currentPath = null;

    for (let key in template) {
      if (template.hasOwnProperty(key)) {
        let parsedKeys = this.parseKey(key);
        currentPath = rootPath.slice();
        currentPath.push(parsedKeys[0].key);
        for (let parsedKey of parsedKeys) {
          switch (parsedKey.op) {
            case '-': // do not check, skip
              break;

            case '?': // optional
              break;

            case '^': // must be null
              if (box.get(currentPath)) {
                throw new Error('Data path "' + currentPath.join('.') + 'MUST be null or undefined');
              }
              break;

            case '&': // type check
              if (typeof template[key] != typeof box.get(currentPath)) {
                throw new Error('Expect type of "' + currentPath.join('.') + '" as [' + (typeof template[key]) +
                  '], but got [' + (typeof box.get(currentPath)) + ']');
              }
              break;

            case '!': // not null
              if (box.get(currentPath) == null || box.get(currentPath) == undefined ) {
                throw new Error('Expect "' + currentPath.join('.') + '" not null, but got ', box.get(currentPath));
              }
              break;

            case '#': // deep equal
              var newRootPath = rootPath.slice();
              newRootPath.push(parsedKey.key);

              if (typeof template[key] == 'object') {
                this.check(box, template[key], newRootPath);
              } else if (typeof template[key] == 'function') {
                let fn = template[key];
                if (!fn(box, box.get(currentPath))) {
                  throw new Error(`Failed to check path:${currentPath.join('.')}`);
                }
              } else {
                throw new Error('Expect "' + currentPath.join('.') + '" to be an object');
              }
              break;
            default: // equal =
              if (typeof template[key] === 'object') {
                var newRootPath = rootPath.slice();
                newRootPath.push(parsedKey.key);
                this.check(box, template[key], newRootPath);
              } else if (typeof template[key] === 'function') {
                let fn = template[key];
                if (!fn(box, box.get(currentPath))) {
                  throw new Error(`Failed to check path:${currentPath.join('.')}`);
                }
              } else {
                if (template[key] != box.get(currentPath)) {
                  throw new Error('Expect "' + currentPath.join('.') + '" as [' + template[key] +
                    '], but got [' + box.get(currentPath) + ']');
                }
              }

              break;
          }
        }
      }
    }
  }
});
