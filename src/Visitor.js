var defaultVisitor = {
  initVisitor() {
  },
  getType() {
    return 'robot';
  },
  enter(entity, box, result) {
  },
  exit(entity, box, result) {
  }
}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'getModel', 'getType', 'enter', 'exit'];
  
  if (!delegate) {
    delegate = defaultVisitor;
  }

  class Visitor {
    constructor(options) {
      this.options = options;
      this.setDelegate(delegate);

      if (this.delegate.initVisitor) {
        this.delegate.initVisitor.call(this);
      }
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();

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

    getModel() {
      return this.model || 'AnonymousVisitorModel'
    }

    getType() {
      if (this.delegate.getType) {
        try {
          this.type = this.delegate.getType.call(this);
        } catch (err) {
          console.error(`Error running [getType] of visitor: ${err.message}`);
        }
      } else {
        this.type = 'robot';
      }

      return this.type;
    }

    enter(entity, box, result) {
      if (this.delegate.enter) {
        try {
          this.delegate.enter.call(this, entity, box, result);
        } catch (err) {
          console.error(`Error running [enter] of visitor [${this.model}]: ${err.message}`);
        }
      }
    }

    exit(entity, error, box, result) {
      if (this.delegate.exit) {
        try {
          this.delegate.exit.call(this, entity, error, box, result);
        } catch (err) {
          console.error(`Error running [exit] of visitor [${this.model}]: ${err.message}`);
        }
      }
    }
  }

  return Visitor;
}
