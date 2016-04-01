exports['testBoxValidationRobot'] = {
  'test box validation': (test) => {
    var BoxValidationRobot = require('../../index').Robots.BoxValidationRobot;
    var Box = require('../../index').Box;

    var robot = BoxValidationRobot({
      'cmd=': 'user.register',
      'name&': 'name could not be null, and must be a string',
      'email&': 'must be a string',
      'password': function(box, v) { // make sure password has uppercase char and number
        if (typeof v !== 'string') return false;
        var hasUpperCase = false;
        var hasNumber = false;
        for (var i = 0; i < v.length; i++) {
          if (!isNaN(v.charAt(i), 10)) {
            hasNumber = true;
          } else {
            if (v.charAt(i) === v.charAt(i).toUpperCase()) hasUpperCase = true;
          }
        }

        return hasUpperCase && hasNumber;
      }
    });

    robot.process(new Box({
      cmd: 'user.register',
      name: 'John',
      email: 'john@test.com',
      password: 'Pwd123'
    }), function(err, box) {
      if (err) {
        test.ok(false, err.message);
      }

      test.ok(!err);

      test.done();
    })
  },

  'test box validation fail': (test) => {
    var BoxValidationRobot = require('../../index').Robots.BoxValidationRobot;
    var Box = require('../../index').Box;

    var robot = BoxValidationRobot({
      'cmd=': 'user.register',
      'name&': 'name could not be null, and must be a string',
      'email&': 'must be a string',
      'password': function(box, v) { // make sure password has uppercase char and number
        if (typeof v !== 'string') return false;
        var hasUpperCase = false;
        var hasNumber = false;
        for (var i = 0; i < v.length; i++) {
          if (!isNaN(v.charAt(i), 10)) {
            hasNumber = true;
          } else {
            if (v.charAt(i) === v.charAt(i).toUpperCase()) hasUpperCase = true;
          }
        }

        return hasUpperCase && hasNumber;
      }
    });

    robot.process(new Box({
      cmd: 'user.register',
      name: 'John',
      email: 'john@test.com',
      password: 'pwd123'
    }), function(err, box) {
      test.ok(!!err);

      test.done();
    })
  }
}
