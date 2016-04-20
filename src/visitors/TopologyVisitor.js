const i11e = require('../../index');

module.exports = i11e.createVisitor({
  willFilter(robot, visitor) {
    // always pass
    return true;
  },

  willProcess(robot, box, ctx) {
    const id = robot.getId();
    const model = robot.getModel();

    // start and end from ProbeRobot
    if (model === 'ProbeRobot') {
      // do not skip the box processing
      return false;
    }

    if (!box.getTag('dev:topology:enabled')) {
      // do not skip the box processing if not enabled
      return false;
    }

    var topology = box.getTag('dev:topology:robot');
    var lastRobot  = box.getTag('dev:topology:robot:last');
    if (!topology) topology = [];

    // add current robot node
    var newRobot = {
      data: {id: id, model: model}
    }
    topology.push(newRobot);

    if (lastRobot) {
      var edge = {
        data: {id: i11e.Seq.newName(), source: lastRobot.data.id, target: newRobot.data.id}
      };
      console.log('record edge', edge);
      topology.push(edge);
    }

    console.log(`record node`, newRobot);
    // update last robot
    box.addTag('dev:topology:robot:last', newRobot);
    box.addTag('dev:topology:robot', topology);

    if (['BranchRobot'].indexOf(model) >= 0) {
      // do not skip box processing
      return false;
    }

    // skip the process, directly pass box to next robot
    return true;
  },

  didProcess(robot, err, box, ctx) {
    const id = robot.getId();
    const model = robot.getModel();

    if (model === 'ProbeRobot') {
      let topology = box.getTag('dev:topology:robot');
      if (!topology) topology = [];

      var probeOptions = box.getTag('probe:options');
      if (probeOptions === 'testSTART') {
        topology.push({
          data: {id: 'testSTART', model: 'testSTART'},
          position: {x: 50, y: 50},
          classes: 'start-node'
        });
        box.addTag('dev:topology:robot', topology);
        box.addTag('dev:topology:robot:last', {data: {id: 'testSTART', model: 'testSTART'}});
        box.addTag('dev:topology:enabled', true);
      } else if (probeOptions === 'testEND') {
        topology.push({
          data: {id: 'testEND', model: 'testEND'},
          position: {x: 50, y: 650},
          classes: 'end-node'
        });
        let lastRobot = box.getTag('dev:topology:robot:last');
        if (lastRobot) {
            topology.push({data: {id: i11e.Seq.newName(), source: lastRobot.data.id, target: 'testEND'}})
        }
        box.addTag('dev:topology:robot', topology);
        box.addTag('dev:topology:robot:last', {data: {id: 'testEND', model: 'testEND'}});
        box.removeTag('dev:topology:enabled');
      }
      return;
    }

    if (!box.getTag('dev:topology:enabled')) {
      return;
    }

    if (['BranchRobot'].indexOf(model) >= 0) {
      // get the _result
      var results = box.get('_results');
      if (results && Array.isArray(results)) {
        var resultBox = new i11e.Box(results[0]);
        // update the robot/edge list
        box.addTag('dev:topology:robot', resultBox.getTag('dev:topology:robot'));
      }

      var topology = box.getTag('dev:topology:robot');
      var lastRobot = box.getTag('dev:topology:robot:last');
      if (!topology) topology = [];

      var newLastRobot = {
        data: {id: id, model: model}
      }

      if (lastRobot) {
        var edge = {
          data: { id: i11e.Seq.newName(), source: lastRobot.data.id, target: newLastRobot.data.id }
        };
        console.log('record edge', edge);
        topology.push(edge);
      }

      box.addTag('dev:topology:robot:last', newLastRobot);
      box.addTag('dev:topology:robot', topology);
    }
  }
});
