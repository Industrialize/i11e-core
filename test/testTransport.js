exports['test transport'] = {
  'test single local transport': (test) => {
    const _ = require('../index').highland;
    const Port = require('../index').Port;
    const Constants = require('../index').Constants;
    var createTransport = require('../index').createTransport;

    // create ports
    const input = new Port('input', {
      mode: Constants.IN
    });
    const output = new Port('output', {
      mode: Constants.OUT
    });

    // create a local transport
    // var TestTransport = createTransport({
    //   connect(port) {},
    //   disconnect(end) {},
    //   incomingListener(msg, done) {
    //     if (msg.getNotifyTag()) {
    //       this.outgoingListener(msg, (err, result) => {});
    //       done(null, msg);
    //     } else {
    //       this.outgoingListener(msg, done);
    //     }
    //   }
    // });

    // the above code equals
    var TestTransport = createTransport();

    // connect transport to ports
    TestTransport('testTransport').connect(input).connect(output);

    input.in().fork()
      .accept({
        cmd: 'greeting'
      })
      .syncWorker((box) => {
        box.set('greeting', 'hello!');
        return box;
      })
      .return(input)
      .drive();

    _([{
        cmd: 'greeting',
        greeting: 'Hi! Nice to meet you'
      }])
      .request(output)
      .errors((err) => {
        test.ok(false, error.mesage);
      })
      .doto((box) => {
        test.equal(box.get('greeting'), 'hello!');
      })
      .done(() => {
        test.done();
      })
  }
}
