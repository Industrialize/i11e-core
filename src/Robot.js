var defaultDelegate = {
  isSync() {return false},
  getModel() {return 'PassThroughRobot'},
  process(box, done) {
    done(null, box);
  }
};

/**
 * Robot creator: create a Robot with a delegate object
 *
 * Delegate object could contain following methods
 * - isSync(): optional, must return true or false to indicate the robot mode,
 * default: false
 * - getModel(): optional, return the model name of this new Robot class
 * - process(box, done): process a box on production line and put it back to production line
 *
 * @param  {object} delegate robot delegate object
 * @return {Function}          a new robot creater function
 */
module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'filter', 'process', 'getModel', 'isSync'];
  const createError = require('./utils').createError;
  const Constants = require('./Constants');
  const Sequence = require('./Sequence');

  if (!delegate) {
    delegate = defaultDelegate;
  }

  /**
   * Robot class
   */
  class Robot {
    /**
     * Constructor of Robot
     * @param  {Object} options   robot settings
     * @return {Robot}         robot instance
     */
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
        visitor.didCreat(this);
      }
"#endif";
    }

    /**
     * Set the robot delegate
     * @internal
     * @param {Object} delegate the delegate object
     */
    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();
      if (this.delegate.isSync) this.sync = this.delegate.isSync();

      if (!this.delegate.process) {
        // default process method
        this.delegate.process = (box, done) => {
          if (done) done(null, box);
          else return box;
        }
      }

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

    /**
     * Get robot id
     * @return {[type]} [description]
     */
    getId() {
      return this.id;
    }

    /**
     * Get robot model
     * @return {[type]} [description]
     */
    getModel() {
      return this.model;
    }

    /**
     * Get robot working mode, sync or async
     * @return {Boolean} true if async mode otherwise false
     */
    isSync() {
      return this.sync;
    }

    /**
     * Filter the box to process
     * @param  {Box} box the box
     * @return {Boolean}     true if accept otherwise false
     */
    filter(box) {
"#if process.env.NODE_ENV !== 'production'";
      const i11e = require('../index');
      var visitors = i11e.visitors.getRobotVisitors();
      for (let visitor of visitors) {
        visitor.willFilter(this, box);
      }
"#endif";

      var passOrNot = true;

      if (this.delegate.filter) passOrNot = this.delegate.filter.call(this, box);

"#if process.env.NODE_ENV !== 'production'";
      for (let visitor of visitors) {
        visitor.didFilter(this, box, passOrNot);
      }
"#endif";
      return passOrNot;
    }

    /**
     * Process the box
     * @param  {Box}   box  the box object to process
     * @param  {Function} done callback function used to put err or processed box back to production line
     * @return {Box}        only return processed box when in sync mode
     */
    process(box, done) {
"#if process.env.NODE_ENV !== 'production'";
      var visitorCtx = {};
      const i11e = require('../index');
      var visitors = i11e.visitors.getRobotVisitors();
      for (let visitor of visitors) {
        visitor.willProcess(this, box, visitorCtx);
      }

      try {
        var ret =  this.delegate.process.call(this, box, (err, result) => {
          if (!this.sync) {
            // for async mode
            for (let visitor of visitors) {
              visitor.didProcess(this, err, result, visitorCtx);
            }
            done(err, result);
          }
        });

        // for sync mode
        if (this.sync) {
          for (let visitor of visitors) {
            visitor.didProcess(this, null, box, visitorCtx);
          }
        }

        return ret;
      } catch (err) {
        if (this.sync) {
          for (let visitor of visitors) {
            visitor.didProcess(this, null, box, visitorCtx);
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
