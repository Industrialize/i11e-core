'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('./highland');
var Box = require('./Box');
var Constants = require('./Constants');
var NodeCache = require('node-cache');
var PassThrough = require('stream').PassThrough;
var createError = require('./utils').createError;

var InPort = function () {
  function InPort(name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, InPort);

    this.name = name;
    this.mode = Constants.IN;
    this.options = options;

    this.transports = {};
    this.observers = {};

    this.incomingStream = new PassThrough({
      objectMode: true
    });

    this.session = new NodeCache({
      stdTTL: this.options.ttl || 100,
      checkperiod: this.options.checkperiod || 120,
      useClones: false
    });
  }

  // -------------------------------------------------------------------------------------
  // Common method for all modes
  // -------------------------------------------------------------------------------------

  _createClass(InPort, [{
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
      this.observers[observer.name] = observer;
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
    value: function send(incomingMsg, done) {
      var box = new Box(incomingMsg);
      this.session.set(box._seq, done);
      this.incomingStream.push(box);
    }

    // -------------------------------------------------------------------------------------
    // Method for IN mode
    // -------------------------------------------------------------------------------------

  }, {
    key: 'in',
    value: function _in() {
      return _(this.incomingStream);
    }
  }, {
    key: 'response',
    value: function response() {
      var _this = this;

      return _.pipeline(_.filter(function (box) {
        return !!box;
      }), _.map(function (box) {
        try {
          var res = _this.session.get(box._seq);
          if (res == undefined) {
            console.warn('Could not find response stream for box: ', box._seq);
          } else if (typeof res == 'function') {
            // callback
            res(null, box);
          } else {
            // stream
            if (box._stream) {
              // handle stream type payload
              box.payload().pipe(res);
            } else {
              res.end(JSON.stringify(box));
            }

            _this.session.del(box._seq);
          }
        } catch (err) {
          throw createError(500, err, box);
        }

        return box;
      }));
    }
  }, {
    key: 'process',
    value: function process(pattern, processor) {
      var parallel = arguments.length <= 2 || arguments[2] === undefined ? 3 : arguments[2];

      this.in().fork().accept(pattern).asyncWorker(processor, parallel).errors(function (err, rethrow) {
        console.error(err.message);
      }).through(this.response()).each(function () {});
      return this;
    }
  }, {
    key: 'return',
    value: function _return(box, done) {
      _([box]).through(this.response()).errors(function (err) {
        done(err);
      }).each(function () {
        done(null, box);
      });

      return this;
    }

    // -------------------------------------------------------------------------------------
    // Method for transport
    // -------------------------------------------------------------------------------------

  }, {
    key: 'incomingMsgListener',
    value: function incomingMsgListener(incomingMsg, done) {
      try {
        this.send(incomingMsg, done);
      } catch (err) {
        console.error(err.toString());
        done(createError(400, err, incomingMsg));
      }
    }
  }]);

  return InPort;
}();

module.exports = InPort;