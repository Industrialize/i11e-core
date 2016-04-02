const createRobotModel = require('../Robot');
var createError = require('../utils').createError;

module.exports = createRobotModel({
  initRobot() {
  },

  getModel() {
    return 'TagRobot';
  },

  process(box, done) {
    try {
      for (var key in this.options) {
        if (this.options.hasOwnProperty(key)) {
          if (this.options[key] == null) {
            box.removeTag(key);
          } else {
            box.addTag(key, this.options[key])
          }
        }
      }
      done(null, box);
    } catch (err) {
      done(createError(500, err, box), box);
    }
  }
});
