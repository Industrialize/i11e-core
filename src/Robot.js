var defaultWorker = {
  process(box, done) {
    done(null, box);
  }
};

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'process'];
  let createError = require('./utils').createError;
  let Constants = require('./Constants');

  if (!delegate) {
    delegate = defaultWorker;
  }

  class Robot {
    constructor(options = {}) {
      this.model = "Unknown Model";
      this.options = options;
      this.sync = false;

      this.setDelegate(delegate);

      if (this.delegate.initRobot) {
        this.delegate.initRobot.call(this);
      }
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();
      if (this.delegate.isSync) this.sync = this.delegate.isSync();

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

    process(box, done) {
      try {
"#if process.env.NODE_ENV !== 'production'";
        var visitorCtx = {};
        const i11e = require('../index');
        var visitors = i11e.visitors.getRobotVisitors();
        for (let visitor of visitors) {
          visitor.enter(this, box, visitorCtx);
        }

        return this.delegate.process.call(this, box, (err, result) => {
          for (let visitor of visitors) {
            visitor.exit(this, err, result, visitorCtx);
          }
          done(err, result);
        });
"#endif";
"#if process.env.NODE_ENV === 'production'";
        return this.delegate.process.call(this, box, done);
"#endif";
      } catch (err) {
        if (done)
          done(createError(500, err, box), box);
        else
          throw createError(500, err, box);
      }
    }
  }

  return Robot;
}
