'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = require('./Constants');

var ReserverdFunctions = ['setDelegate', 'connect', 'disconnect', 'listenOutgoing', 'incomingListener'];

// local transport by default
var defaultTransport = {
  connect: function connect(port) {},
  disconnect: function disconnect(end) {},
  incomingListener: function incomingListener(msg, done) {
    if (msg.getNotifyTag()) {
      this.outgoingListener(msg, function (err, result) {});
      done(null, msg);
    } else {
      this.outgoingListener(msg, done);
    }
  }
};

module.exports = function (delegate) {
  if (!delegate) {
    delegate = defaultTransport;
  }

  var Transport = function () {
    /**
     * Construct a transport
     * @param  {String} name    the name of transport
     * @param  {object} options =             {} the options
     * @return {transport}         transport object
     */

    function Transport(name) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Transport);

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


    _createClass(Transport, [{
      key: 'setDelegate',
      value: function setDelegate(delegate) {
        this.delegate = delegate;

        for (var key in this.delegate) {
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
    }, {
      key: 'connect',
      value: function connect(port) {
        var _this = this;

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
          this.listenOutgoing(function (data, done) {
            return _this.target.incomingMsgListener(data, done);
          });
          this.delegate.connect.call(this, port);
        }

        return this;
      }
    }, {
      key: 'disconnect',
      value: function disconnect(end) {
        if (end === Constants.SOURCE) {
          this.source = null;
        } else if (end === Constants.TARGET) {
          this.target = null;
        }
        this.delegate.disconnect.call(this, end);

        return this;
      }
    }, {
      key: 'listenOutgoing',
      value: function listenOutgoing(listener) {
        this.outgoingListener = listener;
        return this;
      }
    }, {
      key: 'incomingListener',
      value: function incomingListener(box, done) {
        this.delegate.incomingListener.call(this, box, done);
      }
    }]);

    return Transport;
  }();

  return Transport;
};