var defaultPipeline = {
  prodline() {
    return [
      _.map((box) => {
        return box.print();
      })
    ]
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

    pipeline(io, errHandler) {
      return this.delegate.pipeline.call(this, io, errHandler);
    }
  }

  return Pipeline;
}
