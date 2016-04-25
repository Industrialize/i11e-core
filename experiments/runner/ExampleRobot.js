const i11e = require('../../index');

module.exports = i11e.createRobot({
  initRobot() {
  },

  filter(box) {
    return true;
  },

  process(box, done) {
    var name = box.get('name');

    box.set('greetings', `Hello World, ${name}`);

    done(null, box);
  },

  examples() {
    return [
      [
        { // options
        },
        { // input
          "name": "John"
        },
        { // output
          "name": "John",
          "greetings": "Hello World, John"
        }
      ]
    ];
  }

});
