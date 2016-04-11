const Constants = require('./Constants');
const createRobotModel = require('./Robot');

module.exports = {
  /**
   * Create an error with status code and source
   * @param  {number} code     status code
   * @param  {string | object} error object or error message
   * @param  {object} source   error source
   * @return {Error}          Error object with statusCode and source
   */
  createError(code, errOrMsg, source) {
    var error = errOrMsg;
    if (typeof errOrMsg == 'string') {
      error = new Error(errOrMsg);
    }

    error.statusCode = code;

    if (source) error.source = source;

    error.toString = function() {
      return `[${error.statusCode}]:${error.message}`;
    };

    error.toResult = function() {
      return error.source.new(error);
    }

    return error;
  },

  join(a, b, options) {
    a.join(b, options)
  },

  /**
   * Wrap a node callback stype function to a robot
   * @param  {String} model  the model name of the Robot
   * @param  {Array} inputs   the inputs of the fn
   * @param  {Array} outputs   the outputs of the fn
   * @param  {Function} fn callback style api
   * @return {Function}      init function to instantiate robot
   */
  wrapCallback(model, inputs, ouputs, fn) {
    return createRobotModel({
      initRobot() {
      },

      getInputs() {
        return inputs;
      },

      getOutputs() {
        return outputs;
      },

      getModel() {
        return model;
      },

      process(box, done) {
        var args = [];
        for (var i = 0; i < this.inputs.length; i++) {
          args.push(box.get(this.inputs[i]));
        }

        args.push((err) => {
          if (err) {
            return done(err);
          }

          // process the results, skip the 'err' argument
          for (var i = 1; i < arguments.length; i++) {
            if (this.outputs.length >= i) {
              box.set(this.outputs[i - 1], arguments[i]);
            } else {
              console.warn('wrapCallback: Not enough output name defined!');
              box.set('output_' + (i - 1), arguments[i])
            }
          }

          return done(null, box);
        });

        fn.apply(this, args);
      }
    })
  },

  // ---------------------------------------------------------------------------
  // debug util
  // ---------------------------------------------------------------------------

  printProductionLine(name) {
    const G = require('./Global');
    if (G.debug)
      console.log(`|++++ Production Line: [user.register]`);
  },

  printBox(box, options = {}) {
    const G = require('./Global');
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

  printRobot(model, box, options = {}) {
    const wildstring = require('wildstring');
    var matchName = (name, trace) => {
      var parts = trace.split(';');

      for (var i = 0; i < parts.length; i++) {
        if (wildstring.match(parts[i].toLowerCase(), name.toLowerCase())) {
          return true;
        }
      }

      return false;
    };
    const G = require('./Global');
    if (!options.glossary) options.glossary = G.glossary;
    if (!options.printBox) options.unbox = G.unbox;
    if (!options.showHidden) options.showHidden = G.showHidden;
    if (!options.showTag) options.showTag = G.showTag;

    if ((G.debug && model && G.trace && matchName(model, G.trace)) || box.getTag(Constants.tags.DEBUG)) {
      console.log(`|---> Robot: [${model}]`);

      if (options.unbox || box.getTag(Constants.tags.DEBUG_UNBOX)) {
        console.log('|=receive Box:');
        box.print(options.showHidden, options.showTag || box.getTag(Constants.tags.DEBUG_TAG));
      }
    }
  }
}
