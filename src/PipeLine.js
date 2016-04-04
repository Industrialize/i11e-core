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
  const ReserverdFunctions = ['setDelegate', 'process'];
  var _ = require('./prodline');

  if (!delegate) {
    delegate = defaultProdline;
  }

  class ProductionLine {
    constructor(options = {}) {
      this.type = "Unknown Production Line";
      this.options = options;

      this.setDelegate(delegate);
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
      robots.push(_.parallel(this.options.parallel || 3));

      return _.pipeline.apply(_, robots);
    }
  }
}
