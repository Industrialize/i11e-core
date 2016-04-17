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

    create(entity) {
      if (this.delegate.create) {
        try {
          this.delegate.create.call(this);
        } catch (err) {
          console.error(`Error running [create] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }

    connect(entity, tbc) {
      if (this.delegate.connect) {
        try {
          this.delegate.connect.call(this, entity, tbc);
        } catch (err) {
          console.error(`Error running [connect] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }

    disconnect(entity, tbd) {
      if (this.delegate.disconnect) {
        try {
          this.delegate.disconnect.call(this, entity, tbd);
        } catch (err) {
          console.error(`Error running [disconnect] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }

    /**
     * Called when a box enter entity
     * @param  {Object} entity instance of Robot, Pipeline, Port, or Transport
     * @param  {box} box    the current box
     * @param  {Object} ctx the context used to share data with other lifecycle api
     */
    enter(entity, box, ctx) {
      if (this.delegate.enter) {
        try {
          this.delegate.enter.call(this, entity, box, ctx);
        } catch (err) {
          console.error(`Error running [enter] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }

    /**
     * Called when a box exits entity
     * @param  {Object} entity instance of Robot, Pipeline, Port, or Transport
     * @param  {Error} error  the error object if any
     * @param  {box} box    the current box
     * @param  {Object} ctx the context used to share data with other lifecycle api
     */
    exit(entity, error, box, ctx) {
      if (this.delegate.exit) {
        try {
          this.delegate.exit.call(this, entity, error, box, ctx);
        } catch (err) {
          console.error(`Error running [exit] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }
  }

  return Visitor;
}
