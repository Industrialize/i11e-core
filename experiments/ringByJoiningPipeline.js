const i11e = require('../index');
var createPipeline = i11e.createPipeline;
var Source = i11e.Source;
var Box = i11e.Box;

var Trunk = createPipeline();

var IncPipeline = createPipeline({
  process() {
    return this.source._()
      .gp((box, done) => {
        var count = box.get('count');
        console.log('Loop:', count);
        if (count == null)
          count = 0;
        else
          count = count + 1;
        box.set('count', count);
        done(null, box);
      });
  }
});


var ResultPipeline = createPipeline({
  process() {
    return this.source._()
      .doto((box) => {
        console.log('Result:', box.get('count'));
      })
  }
})

var trunk = Trunk();
var inc = IncPipeline();
var result = ResultPipeline();

i11e.join(trunk, inc);

i11e.join(inc, trunk, {
  filter: (box) => {
    return box.get('count') < 10;
  }
});

i11e.join(inc, result, {
  filter: (box) => {
    return box.get('count') >= 10;
  }
});

// run all the pipelines
trunk._().drive();
inc._().drive();
result._().drive();

trunk.push(new Box({
  count: 0
}))
