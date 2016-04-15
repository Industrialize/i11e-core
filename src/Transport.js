const Constants = require('./Constants');

const ReserverdFunctions = ['setDelegate', 'connect', 'disconnect', 'listenOutgoing', 'incomingListener'];

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
      this.options = options;
      this.source = null;
      this.target = null;

      this.observers = {};

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
      // add additional tags when transport
      if (this.options.tags) {
        for (let tag in this.options.tags) {
          box.addTag(tag, this.options.tags[tag]);
        }
      }

      try {
        for (let name in this.observers) {
          this.observers[name](box);
        }
      } catch (err) {
        return done(err, box);
      }

      this.delegate.incomingListener.call(this, box, done);
    }

    addTags(tags) {
      this.options.tags = tags;
      return this;
    }

    observe(observer) {
      this.observers[observer.name] = observer.observer;
      return this;
    }

    unobserve(observerName) {
      if (!observerName) {
        // disconnect all
        this.observers = {};
        return this;
      }

      if (this.observers.hasOwnProperty(observerName)) {
        delete this.observers[observerName];
      }
      return this;
    }

  }

  return Transport;
}
