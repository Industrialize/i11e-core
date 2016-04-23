module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'extend'];

  class Extension {
    constructor(options = {}) {
      this.options = options;

      this.setDelegate(delegate);

      if (this.delegate.initExtension) {
        this.delegate.initExtension.call(this);
      }
    }

    setCallback(registerSugar, registerVisitor) {
      this.registerSugar = registerSugar;
      this.registerVisitor = registerVisitor;
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

    extend() {
      if (this.delegate.extend) {
        this.delegate.extend.call(this);
      }
    }
  }

  return Extension;
}
