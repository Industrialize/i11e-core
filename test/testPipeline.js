exports['test pipeline'] = {
  'test pipeline': (test) => {
    const Constants = require('../index').Constants;
    const Port = require('../index').Port;
    const createPipeline = require('../index').createPipeline;
    const Box = require('../index').Box;

    var GreetingPipeline = createPipeline({
      pipeline(source, target, errHandler) {
        return source.in({
            $cmd: 'example.greeting'
          })
          .gp((box, done) => {
            var name = box.get('name');
            done(null, box.set('greetings', `Hello! ${name}`));
          })
          .return(source);
      }
    });

    var inputPort = new Port('input', {
      mode: Constants.IN
    });

    var pl = GreetingPipeline().pipeline(inputPort).drive();

    inputPort.send(new Box({
      $cmd: 'example.greeting',
      name: 'John'
    }), (err, result) => {
      test.equal(result.get('greetings'), 'Hello! John');
      test.done();
    });
  }
}
