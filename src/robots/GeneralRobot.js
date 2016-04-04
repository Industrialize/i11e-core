const createRobotModel = require('../Robot');
var createError = require('../utils').createError;

module.exports = createRobotModel({
  initRobot() {
    if (typeof this.options !== 'function') {
      throw createError(400, 'MUST init GeneralRobot with a node style function: fn(box, done)!');
    }
    this.fn = this.options;
  },

  getModel() {
    return 'GeneralPurposeRobot';
  },

  process(box, done) {
    try {
      this.fn(box, done);
    } catch (err) {
      done(createError(500, err, box), box);
    }
  }
});
