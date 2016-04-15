const VisitorRegistry = require('./lib/VisitorRegistry');
var visitorRegistry = new VisitorRegistry();

"#if process.env.NODE_ENV !== 'production'";
const DebugTraceRobotVisitor = require('./lib/visitors/DebugTraceRobotVisitor');
visitorRegistry.register(DebugTraceRobotVisitor());

const DebugTracePipelineVisitor = require('./lib/visitors/DebugTracePipelineVisitor');
visitorRegistry.register(DebugTracePipelineVisitor());
"#endif";


var exports = {
  highland: require('./lib/prodline'),
  prodline: require('./lib/prodline'),

  debug: require('./lib/Global'),

  Box: require('./lib/Box'),
  Constants: require('./lib/Constants'),
  Port: require('./lib/Port'),

  Source: require('./lib/Source'),

  Robots: require('./lib/robots'),

  // created robot will be a function
  createRobot: (delegate) => {
    return (options) => {
      var Robot = require('./lib/Robot')(delegate);
      return new Robot(options);
    }
  },
  // created transport will be a function
  createTransport: (delegate) => {
    return (name, options) => {
      var Transport = require('./lib/Transport')(delegate);
      return new Transport(name, options);
    }
  },
  // created factory will be a function
  createFactory: (delegate) => {
    return (name, options) => {
      var Factory = require('./lib/Factory')(delegate);
      return new Factory(name, options);
    }
  },
  // created pipeline will be a function
  createPipeline: (delegate) => {
    return (options) => {
      var Pipeline = require('./lib/Pipeline')(delegate);
      return new Pipeline(options);
    }
  },

  // created visitor will be a function
  createVisitor: (delegate) => {
    return (options) => {
      var Visitor = require('./lib/Visitor')(delegate);
      return new Visitor(options);
    }
  },

  createError: require('./lib/utils').createError,

  join: require('./lib/utils').join,

  visitors: visitorRegistry
}

module.exports = exports;
