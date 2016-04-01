module.exports = {
  highland: require('./lib/highland'),

  debug: require('./lib/Global'),

  Box: require('./lib/Box'),
  Constants: require('./lib/Constants'),
  Port: require('./lib/Port'),

  Robots: require('./lib/robots'),

  createRobot: (delegate) => {
    return (options) => {
      var Robot = require('./lib/Robot')(delegate);
      return new Robot(options);
    }
  },
  createTransport: (delegate) => {
    return (name, options) => {
      var Transport = require('./lib/Transport')(delegate);
      return new Transport(name, options);
    }
  },
  createFactory: (delegate) => {
    return (name, options) => {
      var Factory = require('./lib/Factory')(delegate);
      return new Factory(name, options);
    }
  },
  createError: require('./lib/utils').createError
}
