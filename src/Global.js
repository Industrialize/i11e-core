var argv = require('minimist')(process.argv.slice(2));

module.exports = {
  debug: argv.d || false,  // turn on/off debug mode
  trace: argv.trace || '*', // worker trace pattern
  glossary: argv.g || false, // turn on/off glossary trace
  unbox: argv.b || false, // unbox the box
  showHidden: argv.h || false // show hidden field
}
