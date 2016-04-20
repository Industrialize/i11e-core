module.exports = {
  AcceptRobot: (props) => {
    var AcceptRobotModel = require('./AcceptRobot');
    return new AcceptRobotModel(props);
  },

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
  },

  BranchRobot: (fn) => {
    var BranchRobotModel = require('./BranchRobot');
    return new BranchRobotModel(fn);
  },

  ProbeRobot: (options) => {
    var ProbeRobotModel = require('./ProbeRobot');
    return new ProbeRobotModel(options);
  },

  FileWriteRobot: (file) => {
    var FileWriteRobotModel = require('./FileWriteRobot');
    return new FileWriteRobotModel(file);
  }
}
