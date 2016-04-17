const createVisitor = require('../Visitor');
const utils = require('../utils');
const Constants = require('../Constants');

var DebugTraceFactoryVisitor = createVisitor({
  getType() {
    return 'factory';
  },

  getModel() {
    return "DebugTraceFactoryVisitor";
  },

  enter(port, box, ctx) {
    var factory = port.factory;
    if (factory && box.getTag(Constants.tags.DEBUG)
      && box.getTag(Constants.tags.DEBUG_TRACE_FACTORY)) {
      console.log(`|--> FCT: [${factory.getType()}]-[${factory.id}]: Enter factory via port [${port.name}]`);
    }
  },

  exit(port, err, box, ctx) {
    var factory = port.factory;
    if (factory && box.getTag(Constants.tags.DEBUG)
      && box.getTag(Constants.tags.DEBUG_TRACE_FACTORY)) {
      console.log(`|--> FCT: [${factory.getType()}]-[${factory.id}]: Exit factory via port [${port.name}]`);
    }
  }
});

module.exports = (options) => {
  return new DebugTraceFactoryVisitor(options);
}
