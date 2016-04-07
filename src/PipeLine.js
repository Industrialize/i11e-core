var defaultPipeline = {
  pipeline(source, errHandler) {
    return source._();
  }
}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'run'];
  var _ = require('./prodline');

  if (!delegate) {
    delegate = defaultProdline;
  }

  class Pipeline {
    constructor(options = {}) {
      this.type = "Unknown Production Line";
      this.options = options;

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

    getProdline(source, errHandler) {
      return this.delegate.pipeline.call(this, source, errHandler);
    }

    _(source, errHandler) {
      return this.getProdline(source, errHandler);
    }
  }

  return Pipeline;
}
