'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('./prodline');
var Box = require('./Box');
var Constants = require('./Constants');
var createError = require('./utils').createError;

var DEFAULT_PARALLEL = 5;

var OutPort = function () {
  function OutPort(name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, OutPort);

    this.name = name;
    this.mode = Constants.OUTPUT;
    this.options = options;

    this.transports = {};
    this.observers = {};

    this.loopback = false;
  }

  // -------------------------------------------------------------------------------------
  // Common method for all modes
  // -------------------------------------------------------------------------------------

  _createClass(OutPort, [{
    key: 'connect',
    value: function connect(transport) {
      this.transports[transport.name] = transport;
      return this;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(transportName) {
      if (!transportName) {
        // disconnect all
        this.transports = {};
        return this;
      }

      if (this.transports.hasOwnProperty(transportName)) {
        delete this.transports[transportName];
      }
      return this;
    }
  }, {
    key: 'observe',
    value: function observe(observer) {
      this.observers[observer.name] = observer.observe;
      return this;
    }
  }, {
    key: 'unobserve',
    value: function unobserve(observerName) {
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
  }, {
    key: 'send',
    value: function send(message, done) {
      var _this = this;

      var resBox = new Box(message);
      resBox.set('_results', null); // remove the results

      var results = [];
      _(function (push, next) {
        for (var key in _this.transports) {
          push(null, _this.transports[key]);
          next();
        }
        push(null, _.nil);
      }).map(function (transport) {
        return function (box, cb) {
          return transport.incomingListener(box, cb);
        };
      }).nfcall([new Box(resBox)]).parallel(this.transports.length > 0 ? this.transports.length : 1).errors(function (err) {
        done(err);
      }).each(function (result) {
        try {
          var box = new Box(result);

          // clear the tags
          box.setNotifyTag();

          resBox = resBox ? resBox.merge(box) : box;

          results.push(result);
        } catch (err) {
          throw createError(500, err, box);
        }
      }).done(function () {
        resBox.set('_results', results); // set the results
        done(null, resBox);
      });
    }

    // -------------------------------------------------------------------------------------
    // Method for OUT mode
    // -------------------------------------------------------------------------------------

  }, {
    key: 'setLoopback',
    value: function setLoopback(loopback) {
      this.loopback = !!loopback;
      return this;
    }
  }, {
    key: 'notify',
    value: function notify(msg, done) {
      _([msg]).through(this.out(true)).errors(function (err) {
        done(err);
      }).each(function (box) {
        done(null, box);
      });
    }
  }, {
    key: 'request',
    value: function request(msg, done) {
      _([msg]).through(this.out()).errors(function (err) {
        done(err);
      }).each(function (box) {
        done(null, box);
      });
    }
  }, {
    key: 'out',
    value: function out(notify) {
      var _this2 = this;

      return _.pipeline(_.map(function (data) {
        // turn it to a box, if it is not
        var box = Box.isBox(data) ? data : new Box(data);

        box.setNotifyTag(notify);

        return box;
      }), _.doto(function (box) {
        // observers
        try {
          for (var name in _this2.observers) {
            _this2.observers[name](box);
          }
        } catch (err) {
          throw createError(500, err, box);
        }
      }), _.map(
      // send box out through transports
      _.wrapCallback(function (box, done) {
        try {
          if (_this2.loopback) {
            return done(null, box);
          }
          return _this2.send(box, done);
        } catch (err) {
          throw createError(500, err, box);
        }
      })), _.parallel(this.options.parallel || DEFAULT_PARALLEL)
      // now the result is on the stream as a box
      );
    }
  }]);

  return OutPort;
}();

module.exports = OutPort;