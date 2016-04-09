var defaultPipeline = {
  prodline() {
    // do nothing, just return the source production line
    return this.source._();
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

      if (this.options.source) {
        this.source = this.options.source;
      } else {
        throw createError(400, 'Need "source" options to init a pipeline');
      }

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

    push(box) {
      this.source.push(box);
    }

    _() {
      return this.delegate.prodline.all(this);
    }
  }

  return Pipeline;
}
