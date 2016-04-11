var defaultPipeline = {
  process() {
    // do nothing, just return the source production line
    return this.source._();
  }
}

const createPipeline = (delegate) => {
  const ReserverdFunctions = ['setDelegate', 'initPipeline', 'getHead', 'getTail', 'push', '_', '$', 'process'];
  var _ = require('./prodline');
  var createError = require('./utils').createError;
  var Source = require('./Source');
  var Box = require('./Box');

  if (!delegate) {
    delegate = defaultPipeline;
  }

  class Pipeline {
    constructor(options = {}) {
      this.model = "Unknown Production Line";
      this.options = options;
      this.source = new Source();
      this.tail = null;

      this.outgoings = [];

      this.setDelegate(delegate);

      if (this.delegate.initPipeline) {
        this.delegate.initPipeline.call(this);
      }
    }

    setDelegate(delegate) {
      this.delegate = delegate;

      if (this.delegate.getModel) this.model = this.delegate.getModel();

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

    /**
     * Push a box to the production line
     * It is equivalant to
     * productionLine.getHead().push(box);
     * @param  {Box} box the box to be pushed to the production line
     * @return {Pipeline}     the pipeline instance
     */
    push(box) {
      this.source.push(box);
      return this;
    }

    /**
     * Get the head end of the production line
     * @return {Source} production line source
     */
    getHead() {
      return this.$();
    }

    /**
     * Get the tail end of the production line
     * @return {Stream} production line stream
     */
    getTail() {
      return this._();
    }

    /**
     * Get the head end of the production line, short form of getHead()
     * @return {Source} production line source
     */
    $() {
      return this.source;
    }

    /**
     * Get the tail end of the production line, short form of getTail()
     * @return {Stream} production line stream
     */
    _() {
      if (!this.tail) {
        this.tail = this.delegate.process.call(this)
          .doto((box) => {
            for (let outgoing of this.outgoings) {
              let stream = _([new Box(box)]);

              if (outgoing.options.filter) {
                stream = stream.accept(outgoing.options.filter);
              }

              if (outgoing.options.tags) {
                stream = stream.tag(outgoing.options.tags)
              }

              stream.doto((box) => {
                outgoing.pipeline.push(box);
              })
              .drive();
            }
          });
      }

      return this.tail;
    }

    /**
     * Join this pipeline with another one
     * @param  {Pipeline} pipeline the pipeline to join with
     * @param  {Object} options   options
     *                            - filter: the filter function or filter object, see prodline.accept()
     *                            - tags: the tags to add to the box
     */
    join(pipeline, options = {}) {
      this.outgoings.push({
        pipeline: pipeline,
        options: options
      });
    }
  }

  return Pipeline;
}


module.exports = createPipeline;
