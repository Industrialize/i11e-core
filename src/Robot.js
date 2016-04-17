var defaultDelegate = {
  isSync() {return false},
  getModel() {return 'PassThroughRobot'},
  process(box, done) {
    done(null, box);
  }
};

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'process', 'getModel', 'isSync'];
  const createError = require('./utils').createError;
  const Constants = require('./Constants');
  const Sequence = require('./Sequence');

  if (!delegate) {
    delegate = defaultDelegate;
  }

  class Robot {
    constructor(options = {}) {
      this.id = Sequence.newName(); // robot id
      this.model = "Unknown Model"; // robot model
      this.options = options; // robot options
      this.sync = false;  // robot working mode: sync or async

      this.setDelegate(delegate);

      if (this.delegate.initRobot) {
        this.delegate.initRobot.call(this);
      }

"#if process.env.NODE_ENV !== 'production'";
      const i11e = require('../index');
      var visitors = i11e.visitors.getRobotVisitors();
      for (let visitor of visitors) {
        visitor.create(this);
      }
"#endif";
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

    getId() {
      return this.id;
    }

    getModel() {
      return this.model;
    }

    isSync() {
      return this.sync;
    }

    process(box, done) {
"#if process.env.NODE_ENV !== 'production'";
      var visitorCtx = {};
      const i11e = require('../index');
      var visitors = i11e.visitors.getRobotVisitors();
      for (let visitor of visitors) {
        visitor.enter(this, box, visitorCtx);
      }

      try {
        var ret =  this.delegate.process.call(this, box, (err, result) => {
          if (!this.sync) {
            // for async mode
            for (let visitor of visitors) {
              visitor.exit(this, err, result, visitorCtx);
            }
            done(err, result);
          }
        });

        // for sync mode
        if (this.sync) {
          for (let visitor of visitors) {
            visitor.exit(this, null, box, visitorCtx);
          }
        }

        return ret;
      } catch (err) {
        if (this.sync) {
          for (let visitor of visitors) {
            visitor.exit(this, null, box, visitorCtx);
          }
          throw createError(500, err, box);
        } else {
          done(createError(500, err, box), box);
        }
      }
"#endif";

"#if process.env.NODE_ENV === 'production'";
      try {
        return this.delegate.process.call(this, box, done);
      } catch (err) {
        if (this.sync) {
          throw createError(500, err, box);
        } else {
          done(createError(500, err, box), box);
        }
      }
"#endif";
    }
  }

  return Robot;
}
