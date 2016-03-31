const _ = require('./highland');
const Box = require('./Box');
const Constants = require('./Constants');
const createError = require('./utils').createError;

let DEFAULT_PARALLEL = 5;

class OutPort {
  constructor(name, options = {}) {
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
    this.observers[observer.name] = observer.observe;
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

  send(message, done) {
    var resBox = new Box(message);
    resBox.set('_results', null); // remove the results

    var results = [];
    _((push, next) => {
      for (let key in this.transports) {
        push(null, this.transports[key]);
        next();
      }
      push(null, _.nil);
    })
      .map((transport) => {
        return function(box, cb) {
          return transport.incomingListener(box, cb);
        };
      })
      .nfcall([new Box(resBox)])
      .parallel((this.transports.length > 0) ? this.transports.length : 1)
      .errors((err) => {
        done(err);
      })
      .each((result) => {
        try {
          var box = new Box(result);

          // clear the tags
          box.setNotifyTag();

          resBox = resBox ? resBox.merge(box) : box;

          results.push(result);
        } catch (err) {
          throw createError(500, err, box);
        }
      })
      .done(() => {
        resBox.set('_results', results);  // set the results
        done(null, resBox);
      });
  }

  // -------------------------------------------------------------------------------------
  // Method for OUT mode
  // -------------------------------------------------------------------------------------
  setLoopback(loopback) {
    this.loopback = !!loopback;
    return this;
  }

  notify(msg, done) {
    _([msg])
      .through(this.out(true))
      .errors((err)=>{
        done(err);
      })
      .each((box)=>{
        done(null, box);
      });
  }

  request(msg, done) {
    _([msg])
      .through(this.out())
      .errors((err)=>{
        done(err);
      })
      .each((box)=>{
        done(null, box);
      });
  }

  out(notify) {
    return _.pipeline(
      _.map((data) => {
        // turn it to a box, if it is not
        var box = Box.isBox(data) ? data : new Box(data);

        box.setNotifyTag(notify);

        return box;
      }),
      _.doto((box) => {
        // observers
        try {
          for (let name in this.observers) {
            this.observers[name](box);
          }
        } catch (err) {
          throw createError(500, err, box);
        }
      }),
      _.map(
        // send box out through transports
        _.wrapCallback((box, done) => {
          try {
            if (this.loopback) {
              return done(null, box);
            }
            return this.send(box, done);
          } catch (err) {
            throw createError(500, err, box);
          }
        })),
      _.parallel(this.options.parallel || DEFAULT_PARALLEL)
      // now the result is on the stream as a box
    )
  }
}

module.exports = OutPort;
