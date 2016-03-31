const debug = require('../index').debug;

debug.glossary = false;
debug.debug = true;
debug.trace = "*";
debug.unbox = true;

exports['testFactory'] = {
  'test factory': (test) => {
    var createFactory = require('../index').createFactory;
    var createRobot = require('../index').createRobot;
    var Box = require('../index').Box;


    var Factory = createFactory({
      getPorts() {
        return [
          ['input', 'in']
        ]
      },

      startup() {
        this.getPort('input').in().fork()
          .robot(createRobot({
            getModel() {
              return 'GreetingRobot';
            },
            process(box, done) {
              box.set('greetings', `Hello! ${box.get('name')}`);
              done(null, box);
            }
          })())
          .through(this.getPort('input').response())
          .errors((err) => {
            console.error(err.message);
          })
          .drive();
      }
    });

    var factory = Factory('testFactory');

    factory.startup();

    factory.getPort('input').send(new Box({
      'name': 'John'
    }), (err, result) => {
      test.equal(result.get('greetings'), 'Hello! John');
      test.done();
    })
  }
}
