# Robot

## Description
Robot is the basic unit in **Industrialize**. It consumes a box from production line, processes it, and returns the box to the production line for further processing (by next robot).

````
production line: => [box] => || Robot || => [processed box] => || Robot || =>
````

## How to create a new Robot Model

You can use ***createRobot*** function to create a new Robot model, see example:

````javascript
const i11e = require('i11e');

// create a new robot model
const GreetingRobotModel = i11e.createRobot({
  initRobot() { // optional, init the robot
    this.name = this.options.name || 'Guest';
  },

  isSync() {  // optional, if the robot works in sync mode, default false
    return false;
  },

  getModel() {  // optional, set the new robot model name
    return 'GreetingRobotModel';  
  },

  process(box, done) {  // required, process the box
    box.set('greeting', `Hello World! ${this.name}`);
    done(null, box);
  }
});
````

To test this new Robot Model, you can use the following code:
````javascript
const i11e = require('i11e');
const _ = i11e.prodline;
const Box = i11e.Box;

// create a new greeting robot
greetingRobot = GreetingRobotModel({
  name: 'John'
});

// construct a production line and put one empty box on it
// at the end of the production line, we print the greeting message
// in the box, which is put by the GreetingRobot

// create a production line
_(new Box())  // <== this is your input

  // deploy a GreetingRobot
  .robot(greetingRobot) // <== process input

  // print greeting message in the box
  .each((box) => {   // <== handle result here
    console.log(box.get('greeting'));
  });
````
