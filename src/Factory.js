module.exports = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'getType', 'definePorts', 'startup', 'shutdown'];
  const Port = require('./Port');
  const Sequence = require('./Sequence');


  class Factory {
    constructor(name, options = {}) {
      this.id = Sequence.newName();
      this.name = name;
      this.type = null;
      this.ports = {};
      this.options = options;

      this.setDelegate(delegate);
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.definePorts) {
        let ports = this.delegate.definePorts();

        for (var i = 0; i < ports.length; i++) {
          let port = new Port(ports[i][0], {
            mode: ports[i][1]
          });
          this.ports[port.name] = port;

"#if process.env.NODE_ENV !== 'production'";
          this.ports[port.name].observe({
            name: 'traceVisitorObserver',
            observer: (box) => {

            }
          })
"#endif";

        }
      }

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

    getName() {
      return this.name;
    }

    getPorts(name) {
      if (this.ports.hasOwnProperty(name)) {
        return this.ports[name];
      }

      return null;
    }

    startup(signal) {
      if (this.delegate){
        return this.delegate.startup.call(this, signal);
      }
    }

    shutdown() {
      if (this.delegate) {
        return this.delegate.shutdown.call(this);
      }
    }
  }


  return Factory;
};
