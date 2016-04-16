const createVisitor = require('../Visitor');
const utils = require('../utils');
const Constants = require('../Constants');

var DebugTraceRobotVisitor = createVisitor({
  getType() {
    return 'robot';
  },

  getModel() {
    return "DebugTraceRobotVisitor";
  },

  enter(robot, box, ctx) {
    const utils = require('../utils');
    utils.printRobot(robot, box);
    ctx.startTime = process.hrtime();
  },

  exit(robot, err, box, ctx) {
    var diff = process.hrtime(ctx.startTime);
    if (err) {
      utils.printBox(box, {prefix: '|=send Box:'});

      throw err;
    } else {
      utils.printBox(box, {prefix: '|=send Box:'});
    }
    if (box.getTag(Constants.tags.DEBUG)) {
      console.log(`|    >>time elapsed:${diff[0] * 1000 + diff[1] / 1000000} ms<<`);
    }
  }
});

module.exports = (options) => {
  return new DebugTraceRobotVisitor(options);
}
