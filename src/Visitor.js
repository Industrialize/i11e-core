var defaultVisitor = {
  initVisitor() {
  },
  getType() {
    return 'robot';
  },
  didCreat(entity) {
  },
  willFilter(entity, box) {
  },
  didFilter(entity, box, passOrNot) {
  },
  willProcess(entity, box, ctx) {
  },
  didProcess(entity, err, box, ctx) {
  }
}

module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'getModel', 'getType',
    'didCreate', 'willFilter', 'didFilter', 'willProcess', 'didProcess'];

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

    didCreate(entity) {
      if (this.delegate.didCreate) {
        try {
          this.delegate.didCreate.call(this, entity);
        } catch (err) {
          console.error(`Error running [didCreate] of visitor [${this.model}]: ${err.message}`);
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

    willFilter(entity, box) {
      if (this.delegate.willFilter) {
        try {
          return this.delegate.willFilter.call(this, entity, box);
        } catch (err) {
          console.error(`Error running [willFilter] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }

    didFilter(entity, box, isFiltered) {
      if (this.delegate.didFilter) {
        try {
          return this.delegate.didFilter.call(this, entity, box, isFiltered);
        } catch (err) {
          console.error(`Error running [didFilter] of visitor [${this.model}]: ${err.message}`);
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
    willProcess(entity, box, ctx) {
      if (this.delegate.willProcess) {
        try {
          return this.delegate.willProcess.call(this, entity, box, ctx);
        } catch (err) {
          console.error(`Error running [willProcess] of visitor [${this.model}]: ${err.message}`);
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
    didProcess(entity, error, box, ctx) {
      if (this.delegate.didProcess) {
        try {
          return this.delegate.didProcess.call(this, entity, error, box, ctx);
        } catch (err) {
          console.error(`Error running [didProcess] of visitor [${this.model}]: ${err.message}`);
          console.error(err.stack);
        }
      }
    }
  }

  return Visitor;
}
