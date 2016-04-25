#! /usr/bin/env node

const i11e = require('../index');
const _ = i11e.prodline;
const path = require('path');

function printUsage() {
  console.log('Usage:');
  console.log('robot [robot file]');
}

// get and check arguments
var argv = require('minimist')(process.argv.slice(2));

if (argv._.length == 0) {
  printUsage();
  process.exit(1);
}

// get the robot file, and initiate it
var robotPath = argv._[0];
if (!path.isAbsolute(robotPath)) {
  robotPath = path.join(process.cwd(), robotPath);
}

if (argv.t || argv.test) {
  // test mode
  var Robot = require(robotPath);
  var examples = Robot.examples();

  var robot = Robot();

  _([new i11e.Box({
    name: 'John'
  })])
    .robot(robot)
    .drive((box) => {
      box.print(false, true);
    });
}
