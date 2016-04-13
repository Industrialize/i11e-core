# Robot

## Description
Robot is the basic unit in **Industrialize**. It consumes a box from production line, processes it, and returns the box to the production line for further processing (by next robot).

````
production line: => [box] => -Robot- => [processed box] => -Robot- =>
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

  isSync() {  // optional, if the robot works in sync mode (true), or in async mode (false). default false
    return false;
  },

  getModel() {  // optional, set the new robot model name
    return 'GreetingRobotModel';  
  },

  process(box, done) {  // required, process the box
    // put greeting message in the box as 'greeting'
    box.set('greeting', `Hello World! ${this.name}`);

    // return the box back to production line
    done(null, box);
  }
});
````

To test this new Robot Model, you need to feed it with a box, and check the result in the output box.

See the following code:
````javascript
const i11e = require('i11e');
const _ = i11e.prodline;
const Box = i11e.Box;

// create a new greeting robot
var greetingRobot = GreetingRobotModel({
  name: 'John'
});

// construct a production line and put one empty box on it
// at the end of the production line, we print the greeting message
// in the box, which is put by the GreetingRobot

// construct a production line
_([new Box()])  // <== this is your input

  // deploy a GreetingRobot
  .robot(greetingRobot) // <== process the input

  // print greeting message in the box
  .each((box) => {   // <== handle result here
    console.log(box.get('greeting'));
  });
````

Results:

````sh
> Hello World! John
````

## Methods to implement a Robot

### initRobot()

Optional, called when the robot is initiated. You can use *this.options* to get the robot parameter. for example:

````javascript
const i11e = require('i11e');
RobotModel = createRobot({
  initRobot() {
    console.log(this.options);
  },
  process(box, done) {
    done(null, box);  
  }
});

const options = {// options object
  a: 1,
  b: 'another option'
};
var robot = RobotModel(options);  // the options argument will be seen in initRobot() method as *this.options*
````

### isSync()

Optional, return true (sync mode robot) or false (async mode robot).

If this method return true, the robot works in *sync* mode, and the ***process*** method ignores the second callback parameter 'done'. It must return a box.

````javascript
process(box) {
  box.set('greetings', 'Hello World!');
  return box;
}
````

If this method return false, the robot works in *async* mode, and the ***process*** method accepts the second callback function 'done'. The output box is passed through this callback function.

````javascript
process(box, done) {
  box.set('greetings', 'Hello World!');
  done(null, box);
}
````

### getModel()

Optional, return the robot model name

### process(box, done)

process the box and return it back to production line. If the robot is in sync mode (by overriding isSync() method), it ignores the *done* parameter, and return a box. If the robot is in async mode (default mode), the output box must be passed to the *done* function.
