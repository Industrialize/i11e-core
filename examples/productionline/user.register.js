const i11e = require('../../index');

const Box = i11e.Box;

var createError = i11e.createError;

var utils = require('../../lib/utils');

var TagRobot = i11e.createRobot({
  getModel() {
    return "TagRobot";
  },
  process(box, done) {
    var options = this.options;

    box.addTag(options.name, options.tag);

    done(null, box);
  }
});

var users = {};

var GetUserByEmailRobot = i11e.createRobot({
  getModel() {
    return "GetUserByEmailRobot";
  },
  process(box, done) {
    var email = box.get('email');
    if (users.hasOwnProperty(email)) {
      box.set('user', users[email]);
    }

    done(null, box);
  }
});

var RegisterUserRobot = i11e.createRobot({
  getModel() {
    return "RegisterUserRobot";
  },
  process(box, done) {
    var email = box.get('email');
    var password = box.get('password');
    var name = box.get('name');

    users[email] = {
      email,
      password,
      name
    }

    box.set('id', 'new id');

    done(null, box);
  }
});


module.exports = (inputPort, notifyPort, errHandler) => {
"#if process.env.NODE_ENV !== 'production'";
  utils.printProductionLine('user.register');
"#endif";
  inputPort.in().fork()
    .accept({
      cmd: 'user.register'
    })
    .checkpoint({
      'name&': 'name',
      'email&': 'test@test.com',
      'password&': 'pwd'
    })
    .robot(new GetUserByEmailRobot())
    .checkpoint({
      'name&': 'name',
      'email&': 'test@test.com',
      'password&': 'pwd',
      'user^': 'should be null or undefined!'
    })
    .map((box)=>{
      if (box.get('user')) {
        throw createError(400, 'Already registered!', box);
      }
      return box;
    })
    .checkpoint({
      'name&': 'name',
      'email&': 'test@test.com',
      'password&': 'pwd'
    })
    .robot(new RegisterUserRobot())
    .checkpoint({
      'name&': 'name',
      'email&': 'test@test.com',
      'password&': 'pwd',
      'id&': 'xxxx'
    })
    .through(notifyPort.out(true))  // notify the registration
    .checkpoint({
      'name&': 'name',
      'email&': 'test@test.com',
      'password&': 'pwd',
      'id&': 'xxxx'
    })
    .through(inputPort.response())
    .errors((err)=>{
      if (errHandler) {
        errHandler(err);
      }
    })
    .each(()=>{});
}
