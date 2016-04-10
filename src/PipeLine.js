var defaultPipeline = {
  process() {
    // do nothing, just return the source production line
    return this.source._();
  }
}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'push', '_', 'isNotify', 'process'];
  var _ = require('./prodline');
  var createError = require('./utils').createError;

  if (!delegate) {
    delegate = defaultProdline;
  }

  class Pipeline {
    constructor(options = {}) {
      this.type = "Unknown Production Line";
      this.options = options;

      this.source = null;

      this.setDelegate(delegate);

      if (this.delegate.isNotify) this.notify = this.delegate.isNotify();

      if (this.delegate.initPipeline) {
        this.delegate.initPipeline.call(this);
      }
    }

    isNotify() {
      if (this.options.hasOwnProperty('notify')) {
        return !!this.options.notify;
      }

      if (typeof this.delegate.isNotify) return this.delegate.isNotify();

      return false;
    }

    setSource(source) {
      this.source = source;
      return this;
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getType) this.type = this.delegate.getType();

      for (let key in this.delegate) {
        // skip predefined functions
        if (ReserverdFunctions.indexOf(key) >= 0) {
          continue;
        }

        if (typeof this.delegate[key] === 'function') {
          this[key] = this.delegate[key].bind(this);
        }
      }

      return this;
    }

    /**
     * Push a box to the production line
     * @param  {Box} box the box to be pushed to the production line
     * @return {Pipeline}     the pipeline instance
     */
    push(box) {
      this.source.push(box);
      return this;
    }

    /**
     * Get the production line
     * @return {Stream} production line stream
     */
    _() {
      if (!this.source) {
        throw createError(400, 'No "source" found for the pipeline, please call setSource()');
      }
      return this.delegate.process.call(this);
    }
  }

  return Pipeline;
}
