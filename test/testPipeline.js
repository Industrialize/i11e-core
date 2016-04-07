exports['test pipeline'] = {
  'test pipeline': (test) => {
    const Constants = require('../index').Constants;
    const Port = require('../index').Port;
    const createPipeline = require('../index').createPipeline;
    const Box = require('../index').Box;

    var GreetingPipeline = createPipeline({
      pipeline(io, errHandler) {
        return io.source.in({
            $cmd: 'example.greeting'
          })
          .gp((box, done) => {
            var name = box.get('name');
            done(null, box.set('greetings', `Hello! ${name}`));
          })
          .return(io.source);
      }
    });

    var inputPort = new Port('input', {
      mode: Constants.IN
    });

    var pl = GreetingPipeline().pipeline({source: inputPort}).drive();

    inputPort.send(new Box({
      $cmd: 'example.greeting',
      name: 'John'
    }), (err, result) => {
      test.equal(result.get('greetings'), 'Hello! John');
      test.done();
    });
  }
}
