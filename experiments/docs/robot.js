const i11e = require('../../index');
const _ = i11e.prodline;
const Box = i11e.Box;

// create a new robot model
const GreetingRobotModel = i11e.createRobot({
  initRobot() { // optional, init the robot
    this.locale = this.options.locale || 'en';
  },

  isSync() {  // optional, if the robot works in sync mode (true), or in async mode (false). default false
    return false;
  },

  getModel() {  // optional, set the new robot model name
    return 'GreetingRobotModel';
  },

  process(box, done) {  // required, process the box
    // get the name from current box
    var name = box.get('name') || 'Guest';

    // process according the options
    var greeting = 'Hello!';
    if (this.locale === 'fr') {
      greeting = 'Bonjour!';
    } else if (this.locale === 'zh') {
      greeting = '你好!';
    }

    // put greeting message in the box as 'greeting'
    box.set('greeting', `${greeting} ${name}`);

    // return the box back to production line
    done(null, box);
  }
});

// create a new greeting robot
var greetingRobot = GreetingRobotModel({
  locale: 'fr'  // init the robot
});

// construct a production line and put one empty box on it
// at the end of the production line, we print the greeting message
// in the box, which is put by the GreetingRobot

// construct a production line
_([new Box({
  'name': 'John'
})])  // <== this is your input

  // deploy a GreetingRobot
  .robot(greetingRobot) // <== process the input

  // print greeting message in the box
  .each((box) => {   // <== handle result here
    console.log(box.get('greeting'));
  });