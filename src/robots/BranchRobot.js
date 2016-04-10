const createRobotModel = require('../Robot');
const Source = require('../Source');
const Box = require('../Box');
const NodeCache = require('node-cache');
var createError = require('../utils').createError;


/**
 * BranchRobotModel
 * @param  {Pipeline}   the pipeline for the branch
 * @return {Class}   a new Robot Model class
 */
module.exports = createRobotModel({
  initRobot() {
    this.pipeline = this.options;
    this.source = new Source();

    this.session = new NodeCache({
      stdTTL: this.options.ttl || 100,
      checkperiod: this.options.checkperiod || 120,
      useClones: false
    });

    // build the production line for the branch
    if (this.pipeline.isNotify()) {
      // notify branch, just run the branch. Do NOT need to merge the result
      this.pipeline
        .setSource(this.source)
        ._()
        .errors((err) => {
          console.error('', err.message);
        })
        .drive();
    } else {
      // request branch, need to merge the result
      this.pipeline
        .setSource(this.source)
        ._()
        .doto((box) => {
          // get session value
          let sessionValue = this.session.get(box._seq);
          let originalBox = sessionValue.original;
          let done = sessionValue.callback;

          // get _results from originalBox
          let results = [];
          if (originalBox.has('_results')) {
            results = originalBox.get('_results');
          }

          // update _results
          results.push(box);
          originalBox.set('_results', results);

          // return merged original box
          if (!done) throw createError(400, 'Must have a "done" method');
          let merged = originalBox.merge(box);
          done(null, merged);
        })
        .errors((err) => {
          console.error(err.message);
          let box = err.source;
          let done = this.session.get(box._seq).callback;
          if (!done) throw createError(400, 'Must have a "done" method');
          done(err, box);
        })
        .drive();
    }
  },

  getModel() {
    return 'BranchRobot';
  },

  process(box, done) {
    // duplicate the box
    let newBox = new Box(box);

    if (!this.pipeline.isNotify()) { // check if the pipeline is a request or notify
      // return the original box to the production line
      // the done method will be called in the production line's handler
      // see initRobot() method
      // put the done function to the session
      this.session.set(newBox._seq, {
        original: box,
        callback: done
      });

      // run the branch
      this.source.push(newBox);

    } else {
      // run the branch
      this.source.push(newBox);

      // return the original box directly
      done(null, box);
    }

  }

});
