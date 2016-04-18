const _ = require('./prodline');
const Box = require('./Box');
const Constants = require('./Constants');
const NodeCache = require('node-cache');
const PassThrough = require('stream').PassThrough;
const createError = require('./utils').createError;


class InPort {
  constructor(name, options = {}) {
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
  setFactory(factory) {
    this.factory = factory;
  }

  getName() {
    return this.name;
  }

  getMode() {
    return this.mode;
  }

  connect(transport) {
    this.transports[transport.name] = transport;
    return this;
  }

  disconnect(transportName) {
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

  send(incomingMsg, done) {
    let box = new Box(incomingMsg);
"#if process.env.NODE_ENV !== 'production'";
    var visitorCtx = {};
    const i11e = require('../index');
    var visitors = i11e.visitors.getFactoryVisitors();
    for (let visitor of visitors) {
      visitor.enter(this, box, visitorCtx);
    }
    this.session.set(box._seq, (err, result) => {
      for (let visitor of visitors) {
        visitor.exit(this, err, result, visitorCtx);
      }
      done(err, result);
    });
"#endif"

"#if process.env.NODE_ENV === 'production'";
    this.session.set(box._seq, done);
"#endif"
    this.incomingStream.push(box);
  }

  // -------------------------------------------------------------------------------------
  // Method for IN mode
  // -------------------------------------------------------------------------------------
  in (filter) {
    if (filter) {
      return _(this.incomingStream).fork().accept(filter);
    }
    return _(this.incomingStream).fork();
  }

  response() {
    return _.pipeline(
      _.filter((box) => {
        return !!box;
      }),
      _.map((box) => {
        try {
          var res = this.session.get(box._seq);
          if (res == undefined) {
            console.warn('Could not find response stream for box: ', box._seq);
          } else if (typeof res == 'function') {
            // callback
            if (box._error) {
              res(box._error, box);
            } else {
              res(null, box);
            }
          } else {
            // stream
            if (box._stream) {
              // handle stream type payload
              box.payload().pipe(res);
            } else {
              res.end(JSON.stringify(box));
            }

            this.session.del(box._seq);
          }
        } catch (err) {
          throw createError(500, err, box);
        }

        return box;
      })
    );
  }

  process(pattern, processor, parallel = 3) {
    this.in(pattern)
      .gp(processor, parallel) // => .robot(GeneralRobot(processor), parallel)
      .errors((err, rethrow) => {
        console.error(err.message);
        rethrow(null, err.toResult());
      })
      .through(this.response())
      .each(()=>{});
    return this;
  }

  return (box, done) {
    _([box])
      .through(this.response())
      .errors((err) => {
        done(err);
      })
      .each(() => {
        done(null, box);
      });

    return this;
  }

  // -------------------------------------------------------------------------------------
  // Method for transport
  // -------------------------------------------------------------------------------------
  incomingMsgListener(incomingMsg, done) {
    try {
      this.send(incomingMsg, done);
    } catch (err) {
      console.error(err.toString());
      done(createError(400, err, incomingMsg));
    }
  }
}

module.exports = InPort;
