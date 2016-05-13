const createPipeline = require('../Pipeline');

module.exports = createPipeline({
  initPipeline() {
    this.processor = this.options.processor;
  },

  process() {
    return this.processor.call(this, this.source);
  }
});
