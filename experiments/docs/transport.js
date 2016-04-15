const i11e = require('../../index');

var GreetingFactory = i11e.createFactory({
  definePorts() {
    return [
      ['REQ_IN', 'in'],
      ['NOTIFY_OUT', 'out']
    ]
  },

  startup() {
    this.ports.REQ_IN.in()
      .gp((box, done) => {
        // get the name from current box
        var name = box.get('name') || 'Guest';

        // process according the options
        var greeting = 'Hello!';
        if (this.options.locale === 'fr') {
          greeting = 'Bonjour!';
        } else if (this.options.locale === 'zh') {
          greeting = '你好!';
        }

        // put greeting message in the box as 'greeting'
        box.set('greeting', `${greeting} ${name}`);

        // return the box back to production line
        done(null, box);
      })
      .notify(this.ports.NOTIFY_OUT)
      .return(this.ports.REQ_IN)
      .errors((err) => {
        console.error(err.message);
      })
      .drive();
  }
});

var PrintFactory = i11e.createFactory({
  definePorts() {
    return [
      ['REQ_IN', 'in']
    ]
  },

  startup() {
    this.ports.REQ_IN.in()
      .gpSync((box) => {
        console.log('PRINT:', box.get('message'));
        return box;
      })
      .errors((err) => {
        console.errors(err.message);
      })
      .drive();
  }
});

var LocalTransport = i11e.createTransport();  // by default create a local transport


// init factory, and transport
var greetingFactory = GreetingFactory('greetingFactory', {
  locale: 'fr'
});
var printFactory = PrintFactory('printFactory');
var transport = LocalTransport('localTransport');

transport
  .connect(greetingFactory.getPorts('NOTIFY_OUT'))
  .connect(printFactory.getPorts('REQ_IN'))
  .observe({
    name: 'trace',
    observer: (box) => {
      //console.log('transport box from "greeting factory" to "print factory"')
    }
  })
  .addTags({
    'glossary': {
      message: 'greeting'
    }
  });

// start factory
greetingFactory.startup();
printFactory.startup();

// send box to greeting factory
greetingFactory.getPorts('REQ_IN')
  .send(new i11e.Box({
    name: 'John'
  }), (err, resultBox) => {
    // no result box
  });
