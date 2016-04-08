exports['test source'] = {
  'should create source': (test) => {
    const Source = require('../index').Source;
    const createRobot = require('../index').createRobot;
    const Box = require('../index').Box;

    // a general source
    var source = new Source([
      new Box({
        'cmd': 'example.cmd'
      }
    ]);

    var Robot = createRobot({
      process(box, done) {
        box.set('greetings', 'Hello World!');
        done(null, box);
      }
    });

    var count = 0;
    source._()
      // .robot(Robot())
      .gp((box, done) => {
        box.set('greetings', 'Hello World!');
        done(null, box);
      })
      .each((box) => {
        console.log('first prod line');
        box.print();
        test.equal(box.get('greetings'), 'Hello World!');
        count++;
      });

    source._()
      .robot(Robot())
      .each((box) => {
        console.log('second prod line');
        box.print();
        test.equal(box.get('greetings'), 'Hello World!');
        count++;
      });

    setTimeout(() => {
      test.equal(count, 2);
      test.done();
    }, 3000);
  }
}
