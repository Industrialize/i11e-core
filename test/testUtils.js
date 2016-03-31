exports['test utils'] = {
  'should create error with statusCode': (test) => {
    const createError = require('../index').createError;

    var err = createError(404, 'Not Found', {desc: 'this is a obj'});

    test.equal(err.statusCode, 404);
    test.equal(err.message, 'Not Found');
    test.equal(err.source.desc, 'this is a obj');
    test.equal(err.toString(), '[404]:Not Found');

    test.done();
  }
}
