'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Port = require('./Port');

var ReserverdFunctions = ['setDelegate', 'getName', 'getType', 'getPort', 'startup', 'shutdown'];

module.exports = function (delegate) {
  var Factory = function () {
    function Factory(name) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Factory);

      this.name = name;
      this.type = null;
      this.ports = [];
      this.portMap = {};
      this.options = options;

      this.setDelegate(delegate);
    }

    _createClass(Factory, [{
      key: 'setDelegate',
      value: function setDelegate(delegate) {
        this.delegate = delegate;

        if (this.delegate.getPorts) {
          var ports = this.delegate.getPorts();

          for (var i = 0; i < ports.length; i++) {
            var port = new Port(ports[i][0], {
              mode: ports[i][1]
            });
            this.ports.push(port);
            this.portMap[port.name] = port;
          }
        }

        if (this.delegate.getType) this.type = this.delegate.getType();

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
      key: 'getName',
      value: function getName() {
        return this.name;
      }
    }, {
      key: 'getPort',
      value: function getPort(name) {
        if (this.portMap.hasOwnProperty(name)) {
          return this.portMap[name];
        }

        return null;
      }
    }, {
      key: 'startup',
      value: function startup(signal) {
        if (this.delegate) return this.delegate.startup.call(this, signal);
      }
    }, {
      key: 'shutdown',
      value: function shutdown() {
        if (this.delegate) return this.delegate.shutdown.call(this);
      }
    }]);

    return Factory;
  }();

  return Factory;
};