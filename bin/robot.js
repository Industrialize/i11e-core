#! /usr/bin/env node

const i11e = require('../index');
const _ = i11e.prodline;
const path = require('path');
const readline = require('readline');


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

// get the robot file
var robotPath = argv._[0];
if (!path.isAbsolute(robotPath)) {
  robotPath = path.join(process.cwd(), robotPath);
}
var Robot = require(robotPath);


// -----------------------------------------------------------------------------
// utils
// -----------------------------------------------------------------------------

// run example
function runExample(name) {
  var examples = Robot.examples();

  if (name === 'all') {
    var total = 0;
    var failed = 0;
    for (var example in examples) {
      process.stdout.write(`${example}: `);
      var robot = new Robot(examples[example].options);
      total++;
      _([new i11e.Box(examples[example].input)])
          .robot(robot)
          .checkpoint(examples[example].output)
          .errors((err) => {
            failed++;
            console.error(`Fail! ${err.message}`);
            console.error(err.stack);
          })
          .drive((box) => {
            console.log('done');
          });
    }
    console.log();
    console.log(`fail: ${failed}, pass: ${total-failed}, total: ${total}`)

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
}

function parseInput(input) {
  try {
    var obj = JSON.parse(input);
    return obj;
  } catch (err) {
    return null;
  }
}

function readObject(done) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var buf = "";
  var obj = null;
  rl.on('line', function(line) {
      buf += line;
      obj = parseInput(buf);
      if (obj) {
        rl.close();
        done(obj);
      } else {
        // do nothing
      }
    }).on('close',function(){
      // done(obj);
    });
}

function run(input) {
  _([new i11e.Box(input)])
      .robot(robot)
      .errors((err) => {
        console.error(`Fail! ${err.message}`);
        console.error(err.stack);
      })
      .drive((box) => {
        console.log('== output ==')
        box.print();
      });
}

//------------------------------------------------------------------------------
// program run from here
//------------------------------------------------------------------------------

readObject((obj) => {
  console.log(obj);
})

// if (argv.t || argv.test) {
//   // test mode
//   if (argv.a || argv.all) {
//     runExample('all');
//   } else {
//     var examples = Robot.examples();
//     var tests = ['all'];
//     console.log('Choose your example to run:')
//     console.log('  1: all')
//     var index = 2;
//     for (var example in examples) {
//       tests.push(example);
//       console.log(`  ${index}: ${example}`);
//       index++;
//     }
//
//     var rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout
//     });
//
//     rl.on('line', function(line) {
//         var n = parseInt(line);
//         runExample(tests[n-1]);
//       }).on('close',function(){
//         process.exit(0);
//       });
//     rl.prompt();
//   }
// } else {
//   // interactive mode
//   var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });
//
//   console.log('options object:');
//   readObject((obj) => {
//     console.log(obj);
//   })
//
// }
