exports['test pipeline'] = {
  'test pipeline': (test) => {
    const Constants = require('../index').Constants;
    const Source = require('../index').Source;
    const createPipeline = require('../index').createPipeline;
    const Box = require('../index').Box;

    var GreetingPipeline = createPipeline({
      prodline() {
        return this.source._()
          .accept({
            $cmd: 'example.greeting'
          })
          .gp((box, done) => {
            var name = box.get('name');
            done(null, box.set('greetings', `Hello! ${name}`));
          });
      }
    });

    var source = new Source();

    var pl = GreetingPipeline({source: source})
      ._()
      .doto((box) => {
        test.equal(box.get('greetings'), 'Hello! John');
        test.done();
      })
      .drive();

    source.push(new Box({
      $cmd: 'example.greeting',
      name: 'John'
    });
  }
}
