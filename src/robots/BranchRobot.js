const createRobotModel = require('../Robot');
const Source = require('../Source');
const Box = require('../Box');
var createError = require('../utils').createError;

module.exports = createRobotModel({
  initRobot() {
    if (typeof this.options !== 'function') {
      throw createError(400, 'BranchRobot requires a function as argument');
    }

    this.prodline = this.options;
    this.source = new Source();

    // build the production line for the branch
    this.prodline(this.source).drive();
  },

  getModel() {
    return 'BranchRobot';
  },

  process(box, done) {
    // duplicate the box
    let newBox = new Box(box);
    // run the branch
    this.source.push(newBox);

    // return the original box to the production line
    done(null, box);
  }

});
