'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultWorker = {
  process: function process(box, done) {
    done(null, box);
  }
};

module.exports = function (delegate) {
  var ReserverdFunctions = ['setDelegate', 'process'];
  var createError = require('./utils').createError;

  if (!delegate) {
    delegate = defaultWorker;
  }

  var Robot = function () {
    function Robot() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Robot);

      this.model = "Unknown Model";
      this.options = options;
      this.inputs = [];
      this.outputs = [];
      this.sync = false;

      this.setDelegate(delegate);

      if (this.delegate.initRobot) {
        this.delegate.initRobot.call(this);
      }
    }

    _createClass(Robot, [{
      key: 'setDelegate',
      value: function setDelegate(delegate) {
        this.delegate = delegate;

        if (this.delegate.getModel) this.model = this.delegate.getModel();
        if (this.delegate.isSync) this.sync = this.delegate.isSync();

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
      key: 'process',
      value: function process(box, done) {
        var _this = this;

        try {
          var _ret = function () {
            var utils = require('./utils');
            utils.printRobot(_this.model, box);
            return {
              v: _this.delegate.process.call(_this, box, function (err, result) {
                if (err) {
                  utils.printBox(box, { prefix: '|=send Box:' });
                  throw err;
                } else {
                  utils.printBox(result, { prefix: '|=send Box:' });
                  done(err, result);
                }
              })
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } catch (err) {
          if (done) done(createError(500, err, box), box);else throw createError(500, err, box);
        }
      }
    }]);

    return Robot;
  }();

  return Robot;
};