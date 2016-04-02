const createRobotModel = require('../Robot');
var createError = require('../utils').createError;

module.exports = createRobotModel({
  initRobot() {
  },

  getModel() {
    return 'SetContentRobot';
  },

  process(box, done) {
    try {
      for (var key in this.options) {
        if (this.options.hasOwnProperty(key)) {
          box.set(key, this.options[key]);
        }
      }
      done(null, box);
    } catch (err) {
      done(createError(500, err, box), box);
    }
  }
});
