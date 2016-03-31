const createError = require('./utils').createError;

var defaultWorker = {
  process(box, done) {
    done(null, box);
  }
};

module.exports = (delegate) => {
  if (!delegate) {
    delegate = defaultWorker;
  }

  class Robot {
    constructor(options = {}) {
      this.model = "Unknown Model";
      this.options = options;
      this.inputs = [];
      this.outputs = [];
      this.sync = false;

      this.setDelegate(delegate);
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();
      if (this.delegate.getInputs) this.inputs = this.delegate.getInputs();
      if (this.delegate.getOutputs) this.outputs = this.delegate.getOutputs();
      if (this.delegate.getSync) this.sync = this.delegate.getSync();

      return this;
    }

    wrapCallback(fn) {
      return (box, done) => {
        var args = [];
        for (var i = 0; i < this.inputs.length; i++) {
          args.push(box.get(this.inputs[i]));
        }

        args.push(function(err) {
          if (err) {
            return done(err);
          }

          // process the results, skip the 'err' argument
          for (var i = 1; i < arguments.length; i++) {
            if (this.outputs.length >= i) {
              box.set(this.outputs[i - 1], arguments[i]);
            } else {
              console.warn('WrapCallback: Not enough output name defined!');
              box.set('output_' + (i - 1), arguments[i])
            }
          }

          return done(null, box);
        });

        fn.apply(this, args);
      }
    }

    wrapFunction(fn) {
      return (box) => {
        var args = [];

        for (var i = 0; i < this.inputs.length; i++) {
          args.push(box.get(this.inputs[i]));
        }

        var ret = fn.apply(this, args);

        if (this.outputs.length > 0) {
          box.set(this.outputs[0], ret);
        }

        return box;
      }
    }

    process(box, done) {
      try {
"#if process.env.NODE_ENV !== 'production'";
        const utils = require('./utils');
        utils.printRobot(this.model, box);
        return this.delegate.process.call(this, box, (err, result) => {
          utils.printBox(result, {prefix: '|=send Box:'});
          result._debug = false;
          done(err, result);
        });
"#endif";
"#if process.env.NODE_ENV === 'production'";
        return this.delegate.process.call(this, box, done);
"#endif"
      } catch (err) {
        throw createError(500, err, box);
      }
    }
  }

  return Robot;
}
