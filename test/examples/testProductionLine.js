exports['test example'] = {
  'test [user.register]': (test) => {
    const userRegisterPL = require('../../examples/productionline/user.register');
    const Box = require('../../index').Box;
    const PassThrough = require('stream').PassThrough;
    const _ = require('../../index').highland;
    const Port = require('../../index').Port;
    const Constants = require('../../index').Constants;

    var inputPort = new Port('input', {
      mode: Constants.IN
    });

    var notifyPort = new Port('notify', {
      mode: Constants.OUT
    }).setLoopback(true);

    notifyPort.observe({
      name: 'example',
      observe(box) {
        test.equal(box.get('id'), 'new id');
      }
    })

    userRegisterPL(inputPort, notifyPort, (err) => {
      test.ok(false, err.message, err.source);
      test.done();
    });

    var box = new Box({
      cmd: 'user.register',
      name: 'Jean',
      contacts: {
        email: 'jean@test.com',
        telephone: '0123456789',
        mobile: '0612345678'
      },
      credential: {
        password: 'pwd'
      },
      // record: {
      //   id: 'xxxx'
      // }
    });

    inputPort.send(box.setGlossaryTag({
      email: 'contacts.email',
      password: 'credential.password',
      id: 'record.id'
    }), (err, result) => {
      // console.log(result);
      test.equal(result.get('id'), 'new id');
      test.done();
    });
  }
}
