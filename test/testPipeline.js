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
      isNotify() {
        return true;
      },

      prodline() {
        return this.source._()
          .gp((box, done) => {
            console.log('monitoring');
            test.equal(box.get('greetings'), 'Hello! John');
            done(null, box);
          });
      }
    });

    var RequestPipeline = createPipeline({
      isNotify() {
        return false;
      },

      prodline() {
        return this.source._()
          .gp((box, done) => {
            box.set('requested', true);
            done(null, box);
          });
      }
    });


    var source = new Source();
    var pipeline = GreetingPipeline(source);

    // here demonstrate how to use pipeline
    // 1. connect result handler to handle the pipeline result
    var pl = pipeline._()
      .branch(
        MonitoringPipeline,
        RequestPipeline
      )
      .doto((box) => {
        test.equal(box.get('greetings'), 'Hello! John');
        test.equal(box.get('requested'), true);
        test.done();
      })
      .errors((err) => {
        console.error(err.message);
        test.ok(false, err.message);
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
