exports['test prodline'] = {
  'test pipeline': (test) => {
    const _ = require('../index').prodline;
    const Box = require('../index').Box;

    var pl = _.pipeline(
      _.gp((box, done) => {
        done(null, box.set('greetings', 'Hello World!'));
      })
    )

    _([
      new Box({})
    ])
    .through(pl)
    .each((box)=>{
      console.log(box.get('greetings'));
    })
    .done(()=>{
      test.done();
    })
  }
}
