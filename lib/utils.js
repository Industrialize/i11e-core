'use strict';

var Constants = require('./Constants');
var createRobotModel = require('./Robot');

module.exports = {
  /**
   * Create an error with status code and source
   * @param  {number} code     status code
   * @param  {string | object} error object or error message
   * @param  {object} source   error source
   * @return {Error}          Error object with statusCode and source
   */

  createError: function createError(code, errOrMsg, source) {
    var error = errOrMsg;
    if (typeof errOrMsg == 'string') {
      error = new Error(errOrMsg);
    }

    error.statusCode = code;

    if (source) error.source = source;

    error.toString = function () {
      return '[' + error.statusCode + ']:' + error.message;
    };

    return error;
  },


  /**
   * Wrap a node callback stype function to a robot
   * @param  {String} model  the model name of the Robot
   * @param  {Array} inputs   the inputs of the fn
   * @param  {Array} outputs   the outputs of the fn
   * @param  {Function} fn callback style api
   * @return {Function}      init function to instantiate robot
   */
  wrapCallback: function wrapCallback(model, inputs, ouputs, fn) {
    return createRobotModel({
      initRobot: function initRobot() {},
      getInputs: function getInputs() {
        return inputs;
      },
      getOutputs: function getOutputs() {
        return outputs;
      },
      getModel: function getModel() {
        return model;
      },
      process: function process(box, done) {
        var _arguments = arguments,
            _this = this;

        var args = [];
        for (var i = 0; i < this.inputs.length; i++) {
          args.push(box.get(this.inputs[i]));
        }

        args.push(function (err) {
          if (err) {
            return done(err);
          }

          // process the results, skip the 'err' argument
          for (var i = 1; i < _arguments.length; i++) {
            if (_this.outputs.length >= i) {
              box.set(_this.outputs[i - 1], _arguments[i]);
            } else {
              console.warn('wrapCallback: Not enough output name defined!');
              box.set('output_' + (i - 1), _arguments[i]);
            }
          }

          return done(null, box);
        });

        fn.apply(this, args);
      }
    });
  },


  // ---------------------------------------------------------------------------
  // debug util
  // ---------------------------------------------------------------------------

  printProductionLine: function printProductionLine(name) {
    var G = require('./Global');
    if (G.debug) console.log('|++++ Production Line: [user.register]');
  },
  printBox: function printBox(box) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var G = require('./Global');
    if (!options.glossary) options.glossary = G.glossary;
    if (!options.printBox) options.unbox = G.unbox;
    if (!options.showHidden) options.showHidden = G.showHidden;
    if (!options.showTag) options.showTag = G.showTag;

    if (G.debug || box.getTag(Constants.tags.DEBUG)) {
      if (options.unbox || box.getTag(Constants.tags.DEBUG_UNBOX)) {
        console.log(options.prefix || '  | Box:');
        box.print(options.showHidden, options.showTag || box.getTag(Constants.tags.DEBUG_TAG));
      }
    }
  },
  printRobot: function printRobot(model, box) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var wildstring = require('wildstring');
    var matchName = function matchName(name, trace) {
      var parts = trace.split(';');

      for (var i = 0; i < parts.length; i++) {
        if (wildstring.match(parts[i].toLowerCase(), name.toLowerCase())) {
          return true;
        }
      }

      return false;
    };
    var G = require('./Global');
    if (!options.glossary) options.glossary = G.glossary;
    if (!options.printBox) options.unbox = G.unbox;
    if (!options.showHidden) options.showHidden = G.showHidden;
    if (!options.showTag) options.showTag = G.showTag;

    if (G.debug && model && G.trace && matchName(model, G.trace) || box.getTag(Constants.tags.DEBUG)) {
      console.log('|---> Robot: [' + model + ']');

      if (options.unbox || box.getTag(Constants.tags.DEBUG_UNBOX)) {
        console.log('|=receive Box:');
        box.print(options.showHidden, options.showTag || box.getTag(Constants.tags.DEBUG_TAG));
      }
    }
  }
};