const createVisitor = require('../Visitor');
const utils = require('../utils');
const Constants = require('../Constants');

var DebugTracePipelineVisitor = createVisitor({
  getType() {
    return 'pipeline';
  },

  getModel() {
    return "DebugTracePipelineVisitor";
  },

  enter(pipeline, box, ctx) {
    const utils = require('../utils');
    if (box.getTag(Constants.tags.DEBUG)
      && box.getTag(Constants.tags.DEBUG_TRACE_PIPELINE)) {
      console.log(`enter pipeline:${pipeline.getModel()}`);
    }
    ctx.startTime = process.hrtime();
  },

  exit(pipeline, err, box, ctx) {
    var diff = process.hrtime(ctx.startTime);
    if (box.getTag(Constants.tags.DEBUG)
      && box.getTag(Constants.tags.DEBUG_TRACE_PIPELINE)) {
        console.log(`exit pipeline:${pipeline.getModel()}`);
    }
    if (err) {
      throw err;
    }
    if (box.getTag(Constants.tags.DEBUG)
      && box.getTag(Constants.tags.DEBUG_TRACE_PIPELINE)) {
      console.log(`[PL:${pipeline.getModel()}]: >>time elapsed:${diff[0] * 1000 + diff[1] / 1000000} ms<<`);
    }
  }
});

module.exports = (options) => {
  return new DebugTracePipelineVisitor(options);
}
