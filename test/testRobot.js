exports['test Robot'] = {
  'test robot': (test) => {
    var createRobot = require('../index').createRobot;
    var Box = require('../index').Box;
    var Robot = createRobot({
      getInputs() {
        return ['a', 'b'];
      },

      getOutputs() {
        return ['c'];
      },

      process(box, done) {
        const a = box.get('a');
        const b = box.get('b');

        box.set('c', a + b * this.options.k);

        done(null, box);
      }
    });

    var robot = Robot({
      k: 10
    });

    robot.process(new Box({
      a: 1,
      b: 2,
    }), function(err, box) {
      test.equal(box.get('c'), 21);
      test.done();
    })
  },

  'test robot in production line': (test) => {
    var _ = require('../index').highland;
    var createRobot = require('../index').createRobot;
    var Box = require('../index').Box;
    var Robot = createRobot({
      getInputs() {
        return ['a', 'b'];
      },

      getOutputs() {
        return ['c'];
      },

      process(box, done) {
        const a = box.get('a');
        const b = box.get('b');

        box.set('c', a + b * this.options.k);
        done(null, box);
      }
    });

    var robot = new Robot({
      k: 10
    });

    _([{
        a: 1,
        b: 2
      }])
      .map((v) => {
        return new Box(v)
      })
      .checkpoint({
        "a&": 1,
        "b&": 2
      })
      .robot(robot)
      .checkpoint({
        "a&": 1,
        "b&": 2,
        c: (box, v) => {
          return v == 21
        }
      })
      .checkpoint((box)=>{
        var assert = require('assert');
        assert.equal(box.get('a') + box.get('b') * 10, 21);
        return true;
      })
      .doto((box) => {
        test.equal(box.get('c'), 21);
      })
      .done(() => {
        test.done()
      });
  }
}
