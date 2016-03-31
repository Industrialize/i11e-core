'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/**
 * A highland wrapper
 */

var _ = require('../../highland');
var createError = require('./utils').createError;
var G = require('./Global');

var DEFAULT_PARALLEL = 5;

/**
 * unified method to deploy a worker on a production line
 */
_.addMethod('worker', function (f, async) {
  if (!async) {
    return this.syncWorker(f);
  } else {
    var parallel = !isNaN(async) && async > 1 ? async : DEFAULT_PARALLEL;
    return this.asyncWorker(f, parallel);
  }
});

_.addMethod('syncWorker', function (f) {
  var fn = function fn(box) {
    try {
      return f(box);
    } catch (err) {
      throw createError(500, err, box);
    }
  };
  return this.map(fn);
});

_.addMethod('asyncWorker', function (f, parallel) {
  var self = this;

  var fn = function fn(box, done) {
    try {
      return f(box, done);
    } catch (err) {
      throw createError(500, err, box);
    }
  };

  if (!parallel) parallel = 1;
  return this.through(_.pipeline(_.map(_.wrapCallback(fn)), _.parallel(parallel)));
});

_.addMethod('robot', function (robot, parallel) {
  if (robot.sync) {
    var fn = function fn(box) {
      try {
        return robot.process(box);
      } catch (err) {
        throw createError(500, err, box);
      }
    };
    return this.map(fn);
  } else {
    var fn = function fn(box, done) {
      try {
        return robot.process(box, done);
      } catch (err) {
        throw createError(500, err, box);
      }
    };

    if (!parallel) parallel = 1;
    return this.through(_.pipeline(_.map(_.wrapCallback(fn)), _.parallel(parallel)));
  }
});

_.addMethod('glossary', function (glossary) {
  return this.map(function (box) {
    try {
      return box.setGlossaryTag(glossary);
    } catch (err) {
      if (!err.code) err.code = 500;
      err.source = err.data = box;
      throw err;
    }
  });
});

_.addMethod('return', function (inputPort) {
  return this.through(inputPort.response());
});

_.addMethod('request', function (outputPort) {
  return this.through(outputPort.out(false));
});

_.addMethod('notify', function (outputPort) {
  return this.through(outputPort.out(true));
});

_.addMethod('validate', function (properties) {
  return this.map(function (box) {
    if (Array.isArray(properties)) {
      for (var i = 0; i < properties.length; i++) {
        if (!box.get([properties[i]])) {
          throw createError(400, 'Invalid Request', box);
        }
      }

      return box;
    }

    if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) == 'object') {
      for (var key in properties) {
        if (properties.hasOwnProperty(key)) {
          var type = properties[key];
          var value = box.get(key);
          if (!value || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) != type) {
            throw createError(400, 'Invalid Request', box);
          }
        }
      }

      return box;
    }

    // properties must be either Array or object
    throw createError(400, 'Invalid Request', box);
  });
});

_.addMethod('accept', function (properties) {
  return this.filter(function (box) {
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (!box.get(key) || box.get(key) != properties[key]) {
          return false;
        }
      }
    }

    return true;
  });
});

_.addMethod('set', function (items) {
  return this.map(function (box) {
    for (var key in items) {
      if (items.hasOwnProperty(key)) {
        box.set(key, items[key]);
      }
    }
    return box;
  });
});

_.addMethod('drive', function () {
  return this.each(function (box) {});
});

_.addMethod('checkpoint', function (template) {
  if (typeof template === 'function') {
    var fn = template;

    return this.doto(function (box) {
      try {
        if (!fn(box)) {
          throw new Error('Checkpoint faied!');
        }
      } catch (error) {
        throw createError(400, error, box);
      }
    });
  }

  var parseKey = function parseKey(key) {
    var op = key.charAt(key.length - 1);

    if (op != '!' // not null
     && op != '=' // equal
     && op != '#' // deep equal
     && op != '&' // check type
     && op != '-' // do not check
     && op != '^') {
      // must be null or undefined

      return {
        key: key,
        op: '=' // default operator
      };
    }

    var field = key.substring(0, key.length - 1);

    return {
      key: field,
      op: op
    };
  };

  var check = function check(box, template, rootPath) {
    var currentPath = null;
    for (var key in template) {
      if (template.hasOwnProperty(key)) {
        var parsedKey = parseKey(key);
        currentPath = rootPath.slice();
        currentPath.push(parsedKey.key);

        switch (parsedKey.op) {
          case '=':
            if (_typeof(template[key]) === 'object') {
              var newRootPath = rootPath.slice();
              newRootPath.push(parsedKey.key);
              check(box, template[key], newRootPath);
            } else if (typeof template[key] === 'function') {
              var _fn = template[key];
              if (!_fn(box, box.get(currentPath))) {
                throw new Error('Failed to check path:' + currentPath.join('.'));
              }
            } else {
              if (template[key] != box.get(currentPath)) {
                throw new Error('Expect "' + currentPath.join('.') + '" as [' + template[key] + '], but got [' + box.get(currentPath) + ']');
              }
            }

            break;
          case '-':
            break;
          case '^':
            if (box.get(currentPath)) {
              throw new Error('Data path "' + currentPath.join('.') + 'MUST be null or undefined');
            }
            break;
          case '&':
            if (_typeof(template[key]) != _typeof(box.get(currentPath))) {
              throw new Error('Expect type of "' + currentPath.join('.') + '" as [' + _typeof(template[key]) + '], but got [' + _typeof(box.get(currentPath)) + ']');
            }
            break;
          case '!':
            if (box.get(currentPath) == null) {
              throw new Error('Expect "' + currentPath.join('.') + '" not null, but got null');
            }
            break;
          case '#':
            var newRootPath = rootPath.slice();
            newRootPath.push(parsedKey.key);

            if (_typeof(template[key]) == 'object') {
              check(box, template[key], newRootPath);
            } else if (typeof template[key] == 'function') {
              var _fn2 = template[key];
              if (!_fn2(box, box.get(currentPath))) {
                throw new Error('Failed to check path:' + currentPath.join('.'));
              }
            } else {
              throw new Error('Expect "' + currentPath.join('.') + '" to be an object');
            }
            break;
          default:
            break;
        }
      }
    }
  };

  return this.doto(function (box) {
    try {
      check(box, template, []);
    } catch (error) {
      throw createError(400, error, box);
    }
  });
});

module.exports = _;