var shortid = require('shortid');
var Moniker = require('moniker');

module.exports = {
  new() {
    return shortid.generate();
  },

  newId() {
    return shortid.generate();
  },

  newName() {
    return Moniker.choose();
  }
}
