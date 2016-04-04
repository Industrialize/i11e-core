module.exports = {
  BoxValidationRobot: (template) => {
    var BoxValidationRobotModel = require('./BoxValidationRobot');
    return new BoxValidationRobotModel(template);
  },

  TagRobot: (tags) => {
    var TagRobotModel = require('./TagRobot');
    return new TagRobotModel(tags);
  },

  SetContentRobot: (items) => {
    var SetContentRobotModel = require('./SetContentRobot');
    return new SetContentRobotModel(items);
  },

  GeneralRobot: (fn) => {
    var GeneralRobotModel = require('./GeneralRobot');
    return new GeneralRobotModel(fn);
  }
}
