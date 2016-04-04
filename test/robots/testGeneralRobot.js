exports['test GeneralRobot'] = {
  'test inline function': (test) => {
    const i11e = require('../../index');
    const GeneralRobot = i11e.Robots.GeneralRobot;
    const _ = i11e.prodline;
    const Box = i11e.Box;

    _([
      new Box({
        name: 'John'
      })
    ])
    .doto(()=>{})
    //.debug(true, false, 'greetings')
    .robot(GeneralRobot((box, done) => {
      var name = box.get('name');

      box.set('greetings', `Hello! ${name}`);

      done(null, box);
    }))
    .checkpoint({
      name: 'John',
      greetings: 'Hello! John'
    })
    .done(()=>{
      test.done();
    });
  }
}
