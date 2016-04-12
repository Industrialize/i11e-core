/**
 * A ring shape production line
 *
 * It use a loop pipeline to count from 0 to 10
 */

const i11e = require('../index');
var createPipeline = i11e.createPipeline;
var Source = i11e.Source;
var Box = i11e.Box;

var Trunk = createPipeline({
  process() {
    return this.source._()
  }
});

var LoopPipeline = createPipeline({
  initPipeline() {
    this.entry = this.options.entry;
    this.filter = this.options.filter;
  },

  process() {
    return this.source._()
      .filter(this.filter)
      .gp((box, done) => {
        var count = box.get('count');
        console.log('Loop:', count);
        if (count == null)
          count = 0;
        else
          count = count + 1;
        box.set('count', count);
        done(null, box);
      })
      .doto((box) => {
        // put the box back to the entry
        this.entry.push(box);
      });
  }
});

var pipeline = Trunk();

const loop = 10;

const start = process.hrtime();
pipeline._()
  .branch({
      notify: false,
      pipeline: LoopPipeline({
        entry: pipeline,
        filter: (box) => {
          return box.get('count') < loop
        }
      })
    })
  .filter((box) => {
    return box.get('count') >= loop
  })
  .doto((box) => {
    console.log('Result:', box.get('count'));
    var diff = process.hrtime(start);
    console.log('>> time elapsed:', diff[0] * 1000 + diff[1] / 1000000, 'ms <<');
  })
  .drive();

pipeline
  .push(new Box({
    count: 0
  }));
