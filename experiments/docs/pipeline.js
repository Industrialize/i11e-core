const i11e = require('../../index');
const i11eDebug = require('../../../i11e-debug');
const Box = i11e.Box;

i11e.extend(i11eDebug);

// create a pipeline
var GreetingPipeline = i11e.createPipeline({
  initPipeline() {
    this.locale = this.options.locale || 'en';
  },

  getModel() {
    return 'GreetingPipeline';
  },

  // process method returns the production line
  process() {
    return this.source._()
      .gp((box, done) => {
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
      });
  }
});

// init pipeline
var greetingPL = GreetingPipeline({
  locale: 'fr'
});

// handle the result
greetingPL._()  // get the tail of the production line
  .gpSync((box) => {  // ==> handle the production line output
    console.log(box.get('greeting')); // ==> print the greeting message
    return box; // return it back to production line
  })
  .drive(); // ==> drive the production line to work

// push input box to the pipeline
greetingPL.$() // get the head of the production line
  .push(new Box({ // push an input box to the productoin line
    name: 'John'
  }, {
    'debug': true,
    'debug:trace:pipeline': true
  }));
