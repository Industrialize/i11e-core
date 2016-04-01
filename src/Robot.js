const createError = require('./utils').createError;

var defaultWorker = {
  process(box, done) {
    done(null, box);
  }
};

const ReserverdFunctions = ['setDelegate', 'process'];

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

      if (this.delegate.initRobot) {
        this.delegate.initRobot.call(this);
      }
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();
      if (this.delegate.getInputs) this.inputs = this.delegate.getInputs();
      if (this.delegate.getOutputs) this.outputs = this.delegate.getOutputs();
      if (this.delegate.getSync) this.sync = this.delegate.getSync();

      for (let key in this.delegate) {
        // skip predefined functions
        if (ReserverdFunctions.indexOf(key) >= 0) {
          continue;
        }

        if (typeof this.delegate[key] === 'function') {
          this[key] = this.delegate[key].bind(this);
        }
      }

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
          if (err) {
            utils.printBox(box, {prefix: '|=send Box:'});
            throw err;
          } else {
            utils.printBox(result, {prefix: '|=send Box:'});
            done(err, result);
          }
        });
"#endif";
"#if process.env.NODE_ENV === 'production'";
        return this.delegate.process.call(this, box, done);
"#endif"
      } catch (err) {
        done(createError(500, err, box), box);
      }
    }
  }

  return Robot;
}
