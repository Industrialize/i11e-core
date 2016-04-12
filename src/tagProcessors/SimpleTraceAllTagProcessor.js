const createTagProcessor = require('../TagProcessor');

module.exports = createTagProcessor({
  initTagProcessor() {},

  getTag() {
    return 'SimpleTraceAll';
  },

  process(box, tag) {
    console.log('trace');
  }
});
