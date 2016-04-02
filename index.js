module.exports = {
  highland: require('./lib/prodline'),
  prodline: require('./lib/prodline'),

  debug: require('./lib/Global'),

  Box: require('./lib/Box'),
  Constants: require('./lib/Constants'),
  Port: require('./lib/Port'),

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

  createError: require('./lib/utils').createError
}
