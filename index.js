var exports = {};

// The production line, highland
exports.prodline = require('./lib/prodline');

// Constants
exports.Constants = require('./lib/Constants');

exports.createError = require('./lib/utils').createError;

exports.join = require('./lib/utils').join;

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------

// Box class
exports.Box = require('./lib/Box');

// Port class
exports.Port = require('./lib/Port');

// Source class
exports.Source = require('./lib/Source');

// -----------------------------------------------------------------------------
// extensions
// -----------------------------------------------------------------------------

exports.extend = (extension) => {
  extension.extend({
    registerSugar: exports.registerSugar,
    registerVisitor: exports.registerVisitor
  });
}

// visitor registry
const VisitorRegistry = require('./lib/VisitorRegistry');
var visitors = new VisitorRegistry();

exports.visitors = visitors;

/**
 * Register a visitor
 * @param  {String} type    visitor type, could be one of 'robot', 'pipeline', 'factory', 'transport'
 * @param  {Visitor} visitor visitor
 */
exports.registerVisitor = (type, visitor) => {
  visitors.register(type, visitor);
}

/**
 * Register a syntactic sugar in production line
 * @param  {String} name          the syntactic sugar name
 * @param  {Robot} Robot         robot
 * @param  {function} optionHandler  optional, process options used to init robot
 */
exports.registerSugar = (name, Robot, optionHandler) => {
  var prodline = require('./lib/prodline');
  prodline.addMethod(name, function(options) {
    try {
      if (optionsHandler) opt = optionsHandler(options);
      return this.robot(Robot(opt ? opt : options));
    } catch (err) {
      var createError = require('./lib/utils').createError;
      throw createError(500, err);
    }
  })
}

// -----------------------------------------------------------------------------
// create Models
// -----------------------------------------------------------------------------

// create a new Robot Model
exports.createRobot = (delegate) => {
  return (options) => {
    var Robot = require('./lib/Robot')(delegate);
    return new Robot(options);
  }
};

// create a new Pipeline Model
exports.createPipeline =  (delegate) => {
  return (options) => {
    var Pipeline = require('./lib/Pipeline')(delegate);
    return new Pipeline(options);
  }
};

// create a new Factory Type
exports.createFactory = (delegate) => {
  return (name, options) => {
    var Factory = require('./lib/Factory')(delegate);
    return new Factory(name, options);
  }
};

exports.createTransport = (delegate) => {
  return (name, options) => {
    var Transport = require('./lib/Transport')(delegate);
    return new Transport(name, options);
  }
};

exports.createVisitor = (delegate) => {
  return (options) => {
    var Visitor = require('./lib/Visitor')(delegate);
    return new Visitor(options);
  }
};

exports.version = () => {
  return require('./package.json').version;
};

module.exports = exports;








// var visitorRegistry = new VisitorRegistry();
//
// "#if process.env.NODE_ENV !== 'production'";
// const DebugTraceRobotVisitor = require('./lib/visitors/DebugTraceRobotVisitor');
// visitorRegistry.register('robot', DebugTraceRobotVisitor());
//
// const DebugTracePipelineVisitor = require('./lib/visitors/DebugTracePipelineVisitor');
// visitorRegistry.register('pipeline', DebugTracePipelineVisitor());
//
// const DebugTraceFactoryVisitor = require('./lib/visitors/DebugTraceFactoryVisitor');
// visitorRegistry.register('factory', DebugTraceFactoryVisitor());
// "#endif";
//
// function shortcut(name, Robot, optionsHandler) {
//   var prodline = require('./lib/prodline');
//   prodline.addMethod(name, function(options) {
//     try {
//       if (optionsHandler) opt = optionsHandler(options);
//       return this.robot(Robot(opt ? opt : options));
//     } catch (err) {
//       var createError = require('./lib/utils').createError;
//       throw createError(500, err);
//     }
//   })
// }
//
// var exports__ = {
//   highland: require('./lib/prodline'),
//   prodline: require('./lib/prodline'),
//   debug: require('./lib/Global'),
//
//   Constants: require('./lib/Constants'),
//
//   Box: require('./lib/Box'),
//   Port: require('./lib/Port'),
//   Source: require('./lib/Source'),
//   Robots: require('./lib/robots'),
//
//   // created robot will be a function
//   createRobot: (delegate) => {
//     return (options) => {
//       var Robot = require('./lib/Robot')(delegate);
//       return new Robot(options);
//     }
//   },
//
//   // created pipeline will be a function
//   createPipeline: (delegate) => {
//     return (options) => {
//       var Pipeline = require('./lib/Pipeline')(delegate);
//       return new Pipeline(options);
//     }
//   },
//
//   // created factory will be a function
//   createFactory: (delegate) => {
//     return (name, options) => {
//       var Factory = require('./lib/Factory')(delegate);
//       return new Factory(name, options);
//     }
//   },
//
//   // created transport will be a function
//   createTransport: (delegate) => {
//     return (name, options) => {
//       var Transport = require('./lib/Transport')(delegate);
//       return new Transport(name, options);
//     }
//   },
//
//
//   // created visitor will be a function
//   createVisitor: (delegate) => {
//     return (options) => {
//       var Visitor = require('./lib/Visitor')(delegate);
//       return new Visitor(options);
//     }
//   },
//
//   createError: require('./lib/utils').createError,
//
//   join: require('./lib/utils').join,
//
//   visitors: visitorRegistry
// }
