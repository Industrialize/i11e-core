'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createError = require('./utils').createError;

var defaultWorker = {
  process: function process(box, done) {
    done(null, box);
  }
};

module.exports = function (delegate) {
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
    }

    _createClass(Robot, [{
      key: 'setDelegate',
      value: function setDelegate(delegate) {
        this.delegate = delegate;

        if (this.delegate.getModel) this.model = this.delegate.getModel();
        if (this.delegate.getInputs) this.inputs = this.delegate.getInputs();
        if (this.delegate.getOutputs) this.outputs = this.delegate.getOutputs();
        if (this.delegate.getSync) this.sync = this.delegate.getSync();

        return this;
      }
    }, {
      key: 'wrapCallback',
      value: function wrapCallback(fn) {
        var _this = this;

        return function (box, done) {
          var args = [];
          for (var i = 0; i < _this.inputs.length; i++) {
            args.push(box.get(_this.inputs[i]));
          }

          args.push(function (err) {
            if (err) {
              return done(err);
            }

            // process the results, skip the 'err' argument
            for (var i = 1; i < arguments.length; i++) {
              if (this.outputs.length >= i) {
                box.set(this.outputs[i - 1], arguments[i]);
              } else {
                console.warn('WrapCallback: Not enough output name defined!');
                box.set('output_' + (i - 1), arguments[i]);
              }
            }

            return done(null, box);
          });

          fn.apply(_this, args);
        };
      }
    }, {
      key: 'wrapFunction',
      value: function wrapFunction(fn) {
        var _this2 = this;

        return function (box) {
          var args = [];

          for (var i = 0; i < _this2.inputs.length; i++) {
            args.push(box.get(_this2.inputs[i]));
          }

          var ret = fn.apply(_this2, args);

          if (_this2.outputs.length > 0) {
            box.set(_this2.outputs[0], ret);
          }

          return box;
        };
      }
    }, {
      key: 'process',
      value: function process(box, done) {
        var _this3 = this;

        try {
          var _ret = function () {
            var utils = require('./utils');
            utils.printRobot(_this3.model, box);
            return {
              v: _this3.delegate.process.call(_this3, box, function (err, result) {
                utils.printBox(result, { prefix: '|=send Box:' });
                result._debug = false;
                done(err, result);
              })
            };
          }();

          if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } catch (err) {
          throw createError(500, err, box);
        }
      }
    }]);

    return Robot;
  }();

  return Robot;
};