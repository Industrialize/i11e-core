const _ = require('./prodline');
const PassThrough = require('stream').PassThrough;
const Box = require('./Box');

/**
 * Production line source
 */
class Source {
  /**
   * Construct a production line source
   *
   * @param  {Object} options See highland _(source) method
   * @return {Source}         instance of source
   */
  constructor(options) {
    this.options = options;

    if (!this.options) {
      this.stream = new PassThrough({
        objectMode: true
      });
    }
  }

  /**
   * Get the production line (highland Stream), it returns a new forked
   * highland stream when being called.
   * @return {Stream} highland stream
   */
  getProdline() {
    if (!this.options) return _(this.stream).fork();
    return _(this.options).fork();
  }

  /**
   * A short name for getProdline
   * @return {Stream} highland stream
   */
  _() {
    if (!this.options) return _(this.stream).fork();
    return _(this.options).fork();
  }

  /**
   * Push new box to the production line, this method is ONLY available,
   * when options is null or undefined. Otherwise, it does nothing but
   * print a warning message
   *
   * @param  {Box} box the box to be put on the production line
   * @return {Source}     source itself
   */
  push(box) {
    if (!Box.isBox(box)) box = new Box(box);

    if (!this.options) {
      this.stream.push(box);
    } else {
      console.warn('Can NOT "push" box to a finite production line');
    }

    return this;
  }
}

module.exports = Source;
