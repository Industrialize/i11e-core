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

// Sequence tools to generate sequence/id/name
exports.Seq = require('./lib/Sequence');

// -----------------------------------------------------------------------------
// extensions
// -----------------------------------------------------------------------------

exports.extend = (extension) => {
  extension.setCallback(exports.registerSugar, exports.registerVisitor);
  extension.extend();
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
  prodline.addMethod(name, function() {
    var args = Array.prototype.slice.call(arguments);
    try {
      if (optionHandler) {
        var opt = optionHandler.apply(this, args);
        return this.robot(Robot(opt));
      } else {
        return this.robot(Robot(options));
      }
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
exports.createRobot = require('./lib/Robot');


// create a new Pipeline Model
exports.createPipeline = require('./lib/Pipeline');

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

exports.createExtension = (delegate) => {
  return (options) => {
    var Extension = require('./lib/Extension')(delegate);
    return new Extension(options);
  }
};

exports.version = () => {
  return require('./package.json').version;
};

// -----------------------------------------------------------------------------
// shortcuts
// -----------------------------------------------------------------------------

/**
 * create a new pipeline instance
 * @param  {String} comment   [optional] the comment
 * @param  {Function} processor function to build the pipeline
 * @return {Pipeline}           new pipeline instance
 */
exports.pipeline = (comment, processor) => {
  if (typeof comment === 'function') {
    processor = comment;
    comment = '';
  }
  const GeneralPurposePipeline = require('./lib/pipelines/GeneralPurposePipeline');
  var pipeline = new GeneralPurposePipeline({
    comment,
    processor
  });
  return pipeline;
};

module.exports = exports;
