var defaultPipeline = {
  prodline() {
    // do nothing, just return the source production line
    return this.source._();
  }
}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'run'];
  var _ = require('./prodline');
  var createError = require('./utils').createError;

  if (!delegate) {
    delegate = defaultProdline;
  }

  class Pipeline {
    constructor(source, options = {}) {
      this.type = "Unknown Production Line";
      this.options = options;

      if (!source) {
        throw createError(400, 'Need "source" options to init a pipeline');
      }

      this.source = source;

      this.setDelegate(delegate);

      if (this.delegate.initPipeline) {
        this.delegate.initPipeline.call(this);
      }
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
      return this.delegate.prodline.call(this);
    }
  }

  return Pipeline;
}
