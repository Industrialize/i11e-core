var shortid = require('shortid');

module.exports = {
  new() {
    return shortid.generate();
  }
}
