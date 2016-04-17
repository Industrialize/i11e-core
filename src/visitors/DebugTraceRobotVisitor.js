const createVisitor = require('../Visitor');
const utils = require('../utils');
const Constants = require('../Constants');

var DebugTraceRobotVisitor = createVisitor({
  getModel() {
    return "DebugTraceRobotVisitor";
  },

  enter(robot, box, ctx) {
    const utils = require('../utils');
    //utils.printRobot(robot, box);
    const model = robot.model;
    const id = robot.id;
    console.log(`|--> RBT: [${model}]-[${id}]: Enter Robot`);
    ctx.startTime = process.hrtime();
  },

  exit(robot, err, box, ctx) {
    var diff = process.hrtime(ctx.startTime);
    const model = robot.model;
    const id = robot.id;
    console.log(`|--> RBT: [${model}]-[${id}]: Exit Robot`);

    if (box.getTag(Constants.tags.DEBUG)) {
      console.log(`|    >>time elapsed:${diff[0] * 1000 + diff[1] / 1000000} ms<<`);
    }
  }
});

module.exports = (options) => {
  return new DebugTraceRobotVisitor(options);
}
