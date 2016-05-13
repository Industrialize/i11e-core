const Box = require('../index').Box;

exports['test box'] = {
  'init box': function(test) {
    var box = new Box({
      a: 1,
      b: 'example text'
    });
    test.equal(box.get('a'), 1);
    test.equal(box.get('b'), 'example text');
    test.done();
  },

  'test get with path': function(test) {
    var box = new Box({
      a: {
        b: {
          c: 100
        }
      },
      b: 'example text'
    });
    test.equal(box.get('a.b.c'), 100);
    test.equal(box.get('b'), 'example text');
    test.done();
  },

  'test set with path': function(test) {
    var box = new Box({
      b: 'example text'
    });
    box.set('a.b.c', 100);

    test.equal(box.get('a.b.c'), 100);
    test.equal(box.get('b'), 'example text');
    test.done();
  },

  'test get with partial path': function(test) {
    var box = new Box({
      b: 'example text'
    });
    box.set('a.b.c', 100);

    test.equal(box.get('a.b').c, 100);
    test.equal(box.get('b'), 'example text');
    test.done();
  },

  'test with scope': (test) => {
    var box = new Box({
      a: {
        b: {
          c: 100
        }
      },
      b: 'example text'
    });

    box.addTag('scope', 'a.b');

    test.equal(box.get('c'), 100);
    test.done();
  }
}
