const _ = require('./prodline');
const PassThrough = require('stream').PassThrough;

/**
 * Production line source
 */
class Source {
  constructor() {
    this.stream = new PassThrough({
      objectMode: true
    });
  }

  getProdline() {
    return _(this.stream).fork();
  }

  _() {
    return _(this.stream).fork();
  }

  push(box) {
    this.stream.push(box);
  }
}

module.exports = Source;
