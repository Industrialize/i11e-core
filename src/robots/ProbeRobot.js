const createRobotModel = require('../Robot');

module.exports = createRobotModel({
  initRobot() {
  },

  getModel() {
    return 'ProbeRobot';
  },

  process(box, done) {
    box.addTag('probe:options', this.options);
    done(null, box);
  }
})
