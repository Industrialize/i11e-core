/**
 * A highland wrapper
 */

var _ = require('../highland');
var createError = require('./utils').createError;
var BoxValidationRobot = require('./robots').BoxValidationRobot;
var TagRobot = require('./robots').TagRobot;
var GeneralRobot = require('./robots').GeneralRobot;
var SetContentRobot = require('./robots').SetContentRobot;
var BranchRobot = require('./robots').BranchRobot;
var Constants = require('./Constants');
var Port = require('./Port');
var createTransport = require('./Transport');

var G = require('./Global');

const DEFAULT_PARALLEL = 5;

/**
 * unified method to deploy a worker on a production line
 */
_.addMethod('robot', function(robot, parallel) {
  if (robot.sync) {
    var fn = (box) => {
      try {
        return robot.process(box);
      } catch (err) {
        throw createError(500, err, box);
      }
    };
    return this.map(fn);
  } else {
    var fn = (box, done) => {
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


// -----------------------------------------------------------------------------
// Syntax sugar for commonly used robots
// -----------------------------------------------------------------------------
_.addMethod('validate', function(template) {
  return this.robot(BoxValidationRobot(template));
});

"#if process.env.NODE_ENV !== 'production'";
_.addMethod('checkpoint', function(template) {
  return this.robot(BoxValidationRobot(template));
});
"#endif";

"#if process.env.NODE_ENV === 'production'";
_.addMethod('checkpoint', function(template) {
  return this.doto(() => {});
});
"#endif";

_.addMethod('tag', function(tags) {
  return this.robot(TagRobot(tags));
});

_.addMethod('tags', function(tags) { // same as tag
  return this.robot(TagRobot(tags));
});

_.addMethod('glossary', function(glossary) {
  var tags = {};
  tags[Constants.tags.GLOSSARY] = glossary;
  return this.robot(TagRobot(tags));
});

_.addMethod('set', function(items) {
  return this.robot(SetContentRobot(items));
});

_.addMethod('put', function(items) {
  return this.robot(SetContentRobot(items));
});

_.addMethod('gp', function(fn, parallel) { // general purpose
  return this.robot(GeneralRobot(fn), parallel);
});

_.addMethod('branch', function(...pipelines) {
  var ret = this;
  for (let pipeline of pipelines) {
    ret = ret.robot(BranchRobot(pipeline));
  }
  return ret;
});

// -----------------------------------------------------------------------------
// Useful tool in prodline, which is not implemented as a robot
// -----------------------------------------------------------------------------

_.addMethod('join', function(pipeline) {
  this.doto((box) => {
    pipeline.push(box);
  }).drive();

  return pipeline._();
});

"#if process.env.NODE_ENV !== 'production'";
_.addMethod('debug', function(debug, debug_tag, unboxFilter) {
  var tags = {
    'debug': !!debug ? !!debug : null,
    'debug:unbox': !!debug ? !!debug : null,
    'debug:tag': !!debug_tag ? !!debug_tag : null,
    'debug:unbox:filter': !!unboxFilter ? unboxFilter : null
  };

  // do not use tag robot here, otherwise it will print the tag robot info
  return this.map((box) =>{
    for (var key in tags) {
      if (tags.hasOwnProperty(key)) {
        if (tags[key] == null) {
          box.removeTag(key);
        } else {
          box.addTag(key, tags[key])
        }
      }
    }
    return box;
  });
});
"#endif"

"#if process.env.NODE_ENV === 'production'";
_.addMethod('debug', function(debug) {
  return this.doto(() => {});
});
"#endif"

_.addMethod('accept', function(properties) {
  if (!properties) {
    return true;
  }

  if (typeof properties === 'function') {
    return this.filter(properties);
  }

  return this.filter(function(box) {
    for (var key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (!box.get(key) || box.get(key) != properties[key]) {
          return false;
        }
      }
    }
    return true;
  })
});

_.addMethod('return', function(inputPort) {
  return this.through(inputPort.response());
});

_.addMethod('request', function(outputPort) {
  return this.through(outputPort.out(false));
});

_.addMethod('notify', function(outputPort) {
  return this.through(outputPort.out(true));
});

_.addMethod('drive', function() {
  return this.each((box) => {});
});

"#if process.env.NODE_ENV !== 'production'";
_.addMethod('checkpoint__bak', function(template) {
  if (typeof template === 'function') {
    var fn = template;

    return this.doto(function(box) {
      try {
        if (!fn(box)) {
          throw new Error(`Checkpoint faied!`);
        }
      } catch (error) {
        throw createError(400, error, box);
      }
    });
  }

  var parseKey = function(key) {
    var op = key.charAt(key.length - 1);

    if (op != '!' // not null
      && op != '=' // equal
      && op != '#' // deep equal
      && op != '&' // check type
      && op != '-' // do not check
      && op != '^') { // must be null or undefined

      return {
        key: key,
        op: '=' // default operator
      }
    }

    var field = key.substring(0, key.length - 1);

    return {
      key: field,
      op: op
    }
  }

  var check = function(box, template, rootPath) {
    var currentPath = null;
    for (var key in template) {
      if (template.hasOwnProperty(key)) {
        let parsedKey = parseKey(key);
        currentPath = rootPath.slice();
        currentPath.push(parsedKey.key);

        switch (parsedKey.op) {
          case '=':
            if (typeof template[key] === 'object') {
              var newRootPath = rootPath.slice();
              newRootPath.push(parsedKey.key);
              check(box, template[key], newRootPath);
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
          case '-':
            break;
          case '^':
            if (box.get(currentPath)) {
              throw new Error('Data path "' + currentPath.join('.') + 'MUST be null or undefined');
            }
            break;
          case '&':
            if (typeof template[key] != typeof box.get(currentPath)) {
              throw new Error('Expect type of "' + currentPath.join('.') + '" as [' + (typeof template[key]) +
                '], but got [' + (typeof box.get(currentPath)) + ']');
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

            if (typeof template[key] == 'object') {
              check(box, template[key], newRootPath);
            } else if (typeof template[key] == 'function') {
              let fn = template[key];
              if (!fn(box, box.get(currentPath))) {
                throw new Error(`Failed to check path:${currentPath.join('.')}`);
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
  }

  return this.doto(function(box) {
    try {
      check(box, template, []);
    } catch (error) {
      throw createError(400, error, box);
    }
  });
});
"#endif";

module.exports = _;
