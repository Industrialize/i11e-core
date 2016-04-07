exports['test source'] = {
  'should create source': (test) => {
    const Source = require('../index').Source;
    const createRobot = require('../index').createRobot;
    const Box = require('../index').Box;


    const _ = require('../index').prodline;

    var pl = _.pipeline(
      _.gp((box, done) => {
        box.set('greetings', 'HelloWorld!');
      }),
      _.map((box) => {
        return box.set('greetings 2', 'HelloWorld!');
      })
    )

    _([new Box({})])
      .through(pl)
      .each(console.log)
      .done();


    // var source = new Source();
    //
    // var Robot = createRobot({
    //   process(box, done) {
    //     box.set('greetings', 'Hello World!');
    //
    //     done(null, box);
    //   }
    // });
    //
    // var count = 0;
    // source._()
    //   .robot(Robot())
    //   .each((box) => {
    //     console.log('first prod line');
    //     box.print();
    //     test.equal(box.get('greetings'), 'Hello World!');
    //     count++;
    //   });
    //
    // source._()
    //   .robot(Robot())
    //   .each((box) => {
    //     console.log('second prod line');
    //     box.print();
    //     test.equal(box.get('greetings'), 'Hello World!');
    //     count++;
    //   });
    //
    // source.push(new Box({
    //   'cmd': 'example.cmd'
    // }));
    //
    // setTimeout(()=>{
    //   test.equal(count, 2);
    //   test.done();
    // }, 3000);
  }
}
