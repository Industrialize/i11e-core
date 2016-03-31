const Port = require('./Port');
module.exports = (delegate) => {
  class Factory {
    constructor(name, options = {}) {
      this.name = name;
      this.type = null;
      this.ports = [];
      this.portMap = {};
      this.options = options;

      this.setDelegate(delegate);
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getPorts) {
        let ports = this.delegate.getPorts();

        for (var i = 0; i < ports.length; i++) {
          let port = new Port(ports[i][0], {
            mode: ports[i][1]
          });
          this.ports.push(port);
          this.portMap[port.name] = port;
        }
      }

      if (this.delegate.getType) this.type = this.delegate.getType();

      return this;
    }

    getName() {
      return this.name;
    }

    getPort(name) {
      if (this.portMap.hasOwnProperty(name)) {
        return this.portMap[name];
      }

      return null;
    }

    startup(signal) {
      if (this.delegate)
        return this.delegate.startup.call(this, signal);
    }

    shutdown() {
      if (this.delegate)
        return this.delegate.shutdown.call(this);
    }
  }


  return Factory;
};
