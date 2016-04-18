const Constants = require('./Constants');
const InPort = require('./InPort');
const OutPort = require('./OutPort');

/**
 * Port class.
 *
 * Use "setMode" method to set the port work as Import or Export
 *
 * Use "connect" method to connect the port to transports
 *
 * Common Methods for import and export
 * - send(msg, done): send a message.
 *
 * Methods for import:
 * [stream methods]
 * - in(): the input box stream
 * - response(): the response box stream, used to return the box to its origin
 *
 * [basic methods]
 * - process(pattern, processor): process boxes according to box content pattern
 * - return(box): return the box to its origin
 *
 * Methods for export:
 * [stream methods]
 * - out(): the output box stream
 *
 * [basic methods]
 * - notify(msg, done): send a notify
 * - request(msg, done): send a request
 *
 *
 * Note: you need to set port mode first before connecting your port to
 * transports. If the port mode is changed, all the connected transports
 * are disconnected.
 */
class Port {
  /**
   * Create a port
   * @param  {string} name    port name
   * @param  {object} options port options
   * @return {Port}         port instance
   */
  constructor(name, options = {}) {
    this.name = name;
    this.options = options;

    this.factory = null;  // the factory, who owns this port

    // mode is an internal property, do NOT access it directly,
    // use getMode() and setMode() instead
    this._mode = Constants.GPIO;

    // delegate port according to the mode
    this.delegate = null;
    if (this.options.hasOwnProperty('mode')) {
      this.setMode(this.options.mode);
    }

  }

  getName() {
    return this.name;
  }

  /**
   * Get port mode
   * @return {String} port mode
   */
  getMode() {
    return this._mode;
  }

  /**
   * Set port mode
   * @param  {String} mode   one of 'in' and 'out'
   *
   * @return {Port}   port itself
   */
  setMode(mode) {
    if (mode !== Constants.IN && mode != Constants.OUT) {
      console.warn('Could NOT set port mode to: [', mode, '], invalid mode');
      return this;
    }

    let oldDelegate = this.delegate;
    if (mode === Constants.IN) {
      this.delegate = new InPort(this.name, this.options);
    } else if (mode === Constants.OUT) {
      this.delegate = new OutPort(this.name, this.options);
    }

    // release old delegate
    if (oldDelegate) {
      oldDelegate.disconnect();
      oldDelegate.unobserver();
    }

    this._mode = mode;
    return this;
  }

  // -------------------------------------------------------------------------------------
  // Common method for all modes
  // -------------------------------------------------------------------------------------

  /**
   * Connect to a transport
   * @param  {Transport} transport Transport object
   * @return {Port}           port itself
   */
  connect(transport) {
    if (this.delegate) this.delegate.connect(transport);
    return this;
  }

  /**
   * Disconnect a transport
   * @param  {String} transportName name of the transport
   * @return {Port}               port itself
   */
  disconnect(transportName) {
    if (this.delegate) this.delegate.disconnect(transportName);
    return this;
  }

  /**
   * Observe the port with observer
   * @param  {Observer} observer observer object
   * @return {Port}          port itself
   */
  observe(observer) {
    if (this.delegate) this.delegate.observe(observer);
    return this;
  }

  /**
   * Unobserve the port
   * @param  {String} observerName observer name
   * @return {Port}              port itself
   */
  unobserve(observerName) {
    if (this.delegate) this.delegate.unobserve(observer);
    return this;
  }

  setFactory(factory) {
    this.factory = factory;
    this.delegate.setFactory(factory);
  }

  /**
   * Send a message to the port
   *
   * This method behaves differently when working in different mode.
   * - When working in IN mode: this method simply passes the message to its handlers
   * - When working in OUT mode: this method passes the message to the transports
   *
   * @param  {Object}   msg  message
   * @param  {Function} done callback Function
   * @return {Port}        port itself
   */
  send(msg, done) {
    if (this.delegate) this.delegate.send(msg, done);
    return this;
  }

  // -------------------------------------------------------------------------------------
  // Method for IN mode
  // -------------------------------------------------------------------------------------
  /**
   * process the boxes from the port with specified pattern, and return the result to
   * its origin
   *
   * @param  {Object}   pattern the pattern used to match the box
   * @param  {Function} processor    processor function (box, done) to process the box
   * @param  {Number} parallel    how many processors runs on parallel
   * @return {Port} port itself
   */
  process(pattern, processor, parallel = 3) {
    if (this.getMode() !== Constants.IN) {
      return done(new Error('Port [', this.name, '] can NOT execute "process()" in mode [', this.getMode() ,']'));
    }

    this.delegate.process(pattern, processor, parallel);

    return this;
  }

  /**
   * Return the box to its expediteur
   *
   * @param  {Box} box  the box to return
   * @param  {Function} done  the callback function
   * @return {Port}     port itself
   */
  return(box, done) {
    if (this.getMode() !== Constants.IN) {
      throw new Error('Port [', this.name, '] can NOT execute "return()" in mode [', this.getMode() ,']');
    }

    this.delegate.return(box, done);

    return this;
  }

  /**
   * Input box source of the port
   *
   * @return {Stream} input box stream
   */
  in() {
    if (this.getMode() !== Constants.IN) {
      throw new Error('Port [', this.name, '] can NOT execute "in()" in mode [', this.getMode() ,']');
    }

    return this.delegate.in();
  }

  /**
   * Short name for in()
   * @return {Stream} input box stream
   */
  _() {
    return this.in();
  }

  /**
   * Response stream of the port
   *
   * @return {Stream} response box stream
   */
  response() {
    if (this.getMode() !== Constants.IN) {
      throw new Error('Port [', this.name, '] can NOT execute "response()" in mode [', this.getMode() ,']');
    }

    return this.delegate.response();
  }

  incomingMsgListener(incomingMsg, done) {
    if (this.getMode() !== Constants.IN) {
      throw new Error('Port [', this.name, '] can NOT execute "incomingMsgListener()" in mode [', this.getMode() ,']');
    }

    return this.delegate.incomingMsgListener(incomingMsg, done);
  }
  // -------------------------------------------------------------------------------------
  // Method for OUT mode
  // -------------------------------------------------------------------------------------
  setLoopback(loopback) {
    if (this.getMode() !== Constants.OUT) {
      return done(new Error('Port [', this.name, '] can NOT execute "setLoopback()" in mode [', this.getMode() ,']'));
    }

    this.delegate.setLoopback(loopback);
    return this;
  }

  /**
   * Notify a message
   *
   * @param  {Object}   msg  the message to notify
   * @param  {Function} done the callback function
   * @return {Port}        port itsefl
   */
  notify(msg, done) {
    if (this.getMode() !== Constants.OUT) {
      return done(new Error('Port [', this.name, '] can NOT execute "notify()" in mode [', this.getMode() ,']'));
    }

    this.delegate.notify(msg, done);

    return this;
  }

  /**
   * Make a request
   *
   * @param  {Object}   msg  request body
   * @param  {Function} done the callback function
   * @return {Port}        port itself
   */
  request(msg, done) {
    if (this.getMode() !== Constants.OUT) {
      return done(new Error('Port [', this.name, '] can NOT execute "request()" in mode [', this.getMode() ,']'));
    }

    this.delegate.request(msg, done);
  }

  /**
   * Output box stream
   *
   * @param  {Boolean} notify notify stream or a request stream
   * @return {Stream}        Output box stream
   */
  out(notify) {
    if (this.getMode() !== Constants.OUT) {
      throw new Error('Port [', this.name, '] can NOT execute "out()" in mode [', this.getMode() ,']');
    }
    return this.delegate.out(notify);
  }

}

module.exports = Port;
