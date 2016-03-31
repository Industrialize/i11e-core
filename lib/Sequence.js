'use strict';

var shortid = require('shortid');

module.exports = {
  new: function _new() {
    return shortid.generate();
  }
};