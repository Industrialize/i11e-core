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
    var pipeline = GreetingPipeline(source);


    // here demonstrate how to use pipeline
    // 1. connect result handler to handle the pipeline result
    var pl = pipeline._()
      .doto((box) => {
        test.equal(box.get('greetings'), 'Hello! John');
        test.done();
      })
      .drive();

    // 2. push input box to the pipeline
    pipeline.push(new Box({
      $cmd: 'example.greeting',
      name: 'John'
    }));
  },

  'test branch pipeline': (test) => {
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

    var MonitoringPipeline = createPipeline({
      prodline() {
        return this.source._()
          .gp((box, done) => {
            console.log(box);
            test.equal(box.get('greetings'), 'Hello! John');
            done(null, box);
          });
      }
    });


    var source = new Source();
    var pipeline = GreetingPipeline(source);

    // here demonstrate how to use pipeline
    // 1. connect result handler to handle the pipeline result
    var pl = pipeline._()
      .branch(MonitoringPipeline, MonitoringPipeline)
      .doto((box) => {
        test.equal(box.get('greetings'), 'Hello! John');
        test.done();
      })
      .drive();

    // 2. push input box to the pipeline
    pipeline.push(new Box({
      $cmd: 'example.greeting',
      name: 'John'
    }));
  }
}
