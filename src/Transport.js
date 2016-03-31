const Constants = require('./Constants');

// local transport by default
var defaultTransport = {
  connect(port) {},
  disconnect(end) {},
  incomingListener(msg, done) {
    if (msg.getNotifyTag()) {
      this.outgoingListener(msg, (err, result) => {});
      done(null, msg);
    } else {
      this.outgoingListener(msg, done);
    }
  }
}

module.exports = (delegate) => {
  if (!delegate) {
    delegate = defaultTransport;
  }

  class Transport {
    /**
     * Construct a transport
     * @param  {String} name    the name of transport
     * @param  {object} options =             {} the options
     * @return {transport}         transport object
     */
    constructor(name, options = {}) {
      this.name = name;
      this.option = options;
      this.source = null;
      this.target = null;

      this.outgoingListener = null;

      // delegate object with following functions
      // 1. connect
      // 2. disconnect
      // 3. incomingListener
      this.setDelegate(delegate);
    }

    /**
     * Set the delegate of the transport
     * @param {Object} delegate delegate object
     */
    setDelegate(delegate) {
      this.delegate = delegate;

      return this;
    }

    connect(port) {
      port.connect(this);

      if (port.getMode() === Constants.OUT) {
        if (this.source) {
          this.disconnect(Constants.SOURCE);
        }
        this.source = port;
        this.delegate.connect.call(this, port);
      } else if (port.getMode() === Constants.IN) {
        if (this.target) {
          this.disconnect(Constants.TARGET);
        }
        this.target = port;
        this.listenOutgoing((data, done) => {
          return this.target.incomingMsgListener(data, done);
        });
        this.delegate.connect.call(this, port);
      }

      return this;
    }

    disconnect(end) {
      if (end === Constants.SOURCE) {
        this.source = null;
      } else if (end === Constants.TARGET) {
        this.target = null;
      }
      this.delegate.disconnect.call(this, end);

      return this;
    }

    listenOutgoing(listener) {
      this.outgoingListener = listener;
      return this;
    }

    incomingListener(box, done) {
      this.delegate.incomingListener.call(this, box, done);
    }
  }

  return Transport;
}
