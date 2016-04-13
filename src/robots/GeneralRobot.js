const createRobotModel = require('../Robot');
var createError = require('../utils').createError;

module.exports = createRobotModel({
  initRobot() {
    this.fn = this.options.fn;
    this.sync = this.options.sync || false;

    if (typeof this.fn !== 'function') {
      throw createError(400, 'MUST init GeneralRobot with a "fn" option: fn(box, done)!');
    }
  },

  getModel() {
    return 'GeneralPurposeRobot';
  },

  process(box, done) {
    try {
      if (this.sync) {
        return this.fn(box);
      }
      this.fn(box, done);
    } catch (err) {
      done(createError(500, err, box), box);
    }
  }
});
