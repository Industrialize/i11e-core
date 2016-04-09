const createRobotModel = require('../Robot');
const Source = require('../Source');
const Box = require('../Box');
const NodeCache = require('node-cache');
var createError = require('../utils').createError;


module.exports = createRobotModel({
  initRobot() {
    if (typeof this.options !== 'function') {
      throw createError(400, 'BranchRobot requires a function as argument');
    }

    this.pipeline = this.options;
    this.source = new Source();

    this.session = new NodeCache({
      stdTTL: this.options.ttl || 100,
      checkperiod: this.options.checkperiod || 120,
      useClones: false
    });

    // build the production line for the branch
    this.pipeline(this.source)
      ._()
      .doto((box) => {
        let done = this.session.get(box._seq);
        if (!done) throw createError(400, 'Must have a "done" method');
        done(null, box);
      })
      .errors((err) => {
        let box = err.source;
        let done = this.session.get(box._seq);
        if (!done) throw createError(400, 'Must have a "done" method');
        done(err, box);
      })
      .drive();
  },

  getModel() {
    return 'BranchRobot';
  },

  process(box, done) {
    // duplicate the box
    let newBox = new Box(box);

    // put the done function to the session
    this.session.set(newBox._seq, done);

    // run the branch
    this.source.push(newBox);

    // return the original box to the production line
    // the done method will be called in the production line's handler
    // see initRobot() method
    // done(null, box);
  }

});
