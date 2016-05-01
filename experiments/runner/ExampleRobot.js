const i11e = require('../../index');

module.exports = i11e.createRobot({
  initRobot() {
  },

  input() {
    return {
      "name:!&": "John"  // name, must have, type must be string 
    }
  },

  output() {
    return {
      "greetings": (box, v) => {
        return v === `Hello World, ${box.get('name')}`;
      }
    }
  },

  filter(box) {
    return true;
  },

  process(box, done) {
    var name = box.get('name') || 'Guest';

    box.set('greetings', `Hello World, ${name}`);

    done(null, box);
  },

  examples() {
    return {

      "basic usage": {
        options: { // options
        },
        input: { // input
          "name": "John"
        },
        output: { // output
          "name": "John",
          "greetings": "Hello World, John"
        }
      },

      "greeting without name": {
        options: {},
        input: {},
        output: {
          "greetings": "Hello World, Guest"
        }
      }
    };
  }
});
