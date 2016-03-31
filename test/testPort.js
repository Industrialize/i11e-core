exports['test port'] = {
  'test input port stream': (test) => {
    const Constants = require('../index').Constants;
    const Port = require('../index').Port;

    const port = new Port('InPort', {
      mode: Constants.IN
    })

    port.in()
      .through(port.response())
      .errors((err) => {
        test.ok(false, err.message);
      });

    var f = port.delegate.incomingMsgListener.bind(port.delegate);
    f(1, function(err, result) {
      test.equal(result._payload, 1);

      test.done();
    });
  },

  'test input port - process()': (test) => {
    const Constants = require('../index').Constants;
    const Port = require('../index').Port;

    const port = new Port('InPort', {
      mode: Constants.IN
    });

    port.process({cmd:'test'}, (box, done)=>{
      done(null, box);
    });

    port.send({cmd: 'test', value: 1}, (err, result)=> {
      test.equal(result.get('value'), 1);
      test.done();
    });
  },

  'test output port stream': (test) => {
    const Constants = require('../index').Constants;
    const Port = require('../index').Port;
    const _ = require('../index').highland;

    const port = new Port('OutPort', {
      mode: Constants.OUT
    });

    port.connect({
      incomingListener: function(data, done) {
        done(null, data);
      }
    });

    var index = 0;
    _([{
          t: 'this is an object'
        },
        1,
        'simple string', ['1', 2, 'three']
      ])
      .through(port.out())
      .doto((box) => {
        switch (index) {
          case 0:
            index++;
            test.equal(box.get('t'), 'this is an object');
            test.equal(box.get('_results')[0].t, 'this is an object');
            break;
          case 1:
            index++;
            test.equal(box._payload, 1);
            test.equal(box.get('_results')[0]._payload, 1);
            break;
          case 2:
            index++;
            test.equal(box._payload, 'simple string');
            test.equal(box.get('_results')[0]._payload, 'simple string');
            break;
          case 3:
            index++;
            test.equal(box[0], '1');
            test.equal(box.get('1'), 2);
            test.equal(box.get('2'), 'three');
            break;
          default:
            test.ok(false)
        }
      })
      .errors((err) => {
        console.log(err);
        test.ok(false, err);
      })
      .done(() => {
        test.done();
      });
  }
}
