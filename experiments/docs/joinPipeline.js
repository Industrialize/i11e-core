const i11e = require('../../index');
const Box = i11e.Box;

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

// print the 'message' property to the console
var PrintPipeline = i11e.createPipeline({
  getModel() {
    return 'PrintPipeline';
  },
  process() {
    return this.source._()
      .gp((box, done) => {
        console.log(box.get('message'));
        done(null, box);
      });
  }
});


// create two pipeline instance
var greetingPL = GreetingPipeline({
  locale: 'fr'
});

var printPL = PrintPipeline();

// join the two pipelines
i11e.join(greetingPL, printPL, {
  tags: {
    'glossary': {
      'message': 'greeting'
    }
  }
});

// run the two pipelines
greetingPL._().drive();
printPL._()
.doto((box) => {   // <== handle result here
  // console.log(box.get('greeting'));
  const fs = require('fs');
  const path = require('path');
  const content = "var visualdata = " + JSON.stringify(box.getTag('dev:topology:robot'), null, 2);
  fs.writeFile(path.join(__dirname, '../visual/data-tmp.js'), content, function(err) {
    if (err)
      console.error(err.message);
  });
}).drive();


const TopologyVisitor = require('../../lib/visitors/TopologyVisitor');
i11e.registerVisitor('robot', TopologyVisitor());

// send input box
greetingPL.$().push(new Box({
  nom: 'John'
},
{
  "glossary": {
    "name": "nom"   // glossary
  },
  'dev:topology:enabled': true
}));
