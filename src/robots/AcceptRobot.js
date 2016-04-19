const createRobotModel = require('../Robot');

module.exports = createRobotModel({
  initRobot() {
    this.props = this.options;
  },

  getModel() {
    return 'AcceptRobot';
  },

  filter(box) {
    if (!this.props) {
      return true;
    }

    if (typeof this.props === 'function') {
      return this.props(box);
    }

    for (var key in this.props) {
      if (this.props.hasOwnProperty(key)) {
        if (!box.get(key) || box.get(key) != this.props[key]) {
          return false;
        }
      }
    }

    return true;
  }
})
