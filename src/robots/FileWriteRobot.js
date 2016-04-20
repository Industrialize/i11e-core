const createRobotModel = require('../Robot');
const fs = require('fs');
const path = require('path');

module.exports = createRobotModel({
  initRobot() {
    this.file = this.options || path.join(__dirname, 'file_write_robot_output.js');
  },

  getModel() {
    return 'FileWriteRobot';
  },

  process(box, done) {
    var content = box.get('content');

    fs.writeFile(this.file, content, function(err) {
      done(err, box);
    });
  }
});
