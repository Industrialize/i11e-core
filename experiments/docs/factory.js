const i11e = require('../../index');
const Box = i11e.Box;

// create a pipeline that can be used in your factory
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

// create your factory
var GreetingFactory = i11e.createFactory({
  // define only one port for this factory "REQ_IN"
  definePorts() {
    return [
      ['REQ_IN', 'in']
    ]
  },

  getType() {
    return 'GreetingFactory';
  },

  // start the factory, put your init code here, usually you construct the production
  // line here
  startup(signal) {
    var greetingPL = GreetingPipeline({locale: this.options.locale});

    // REQ_IN is an input port
    this.ports.REQ_IN.in() // get production line from port REQ_IN
      .checkpoint({
        'name&': 'Michael'  // box should have 'name' as string
      })
      // redirect your production line to the greeting production line and get result from it
      .branch({
        pipeline: greetingPL,
        notify: false   // request mode, the result box of greetingPL will pipe to the trunk
      })
      .checkpoint({
        'name&': 'Michael',
        'greeting!': 'Hello World! Michael' // greeting MUST NOT be null
      })
      .errors((err) => {  // print the error if there is any during production process
        console.error(err.message);
      })
      .return(this.ports.REQ_IN)  // return the result of this production line to port REQ_IN
      .errors((err) => { // print the error if there is any during return process
        console.error(err.message);
      })
      .drive();
  },

  // called when shutdown
  shutdown() {
    // do nothing
  }
});

// next, create a factory instance
var greetingFactory = GreetingFactory('greetingFactory', {
  locale: 'fr'
});

// start it
greetingFactory.startup();

// now you can send box to the REQ_IN port and receive result at the callback
greetingFactory.getPorts('REQ_IN').send(new Box({
  name: 'John'
}, {
  'debug': true,
  'debug:trace:pipeline': true,
  'debug:trace:factory': true
}), (err, resultBox) => {
  console.log(resultBox.get('greeting'));
});
