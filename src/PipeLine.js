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
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'process'];
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

    process() {
      var robots = this.delegate.getRobots();
      return _.pipeline.apply(_, robots);
    }
  }

  return Pipeline;
}
