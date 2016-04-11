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

pipeline._()
  .branch({
      notify: false,
      pipeline: LoopPipeline({
        entry: pipeline,
        filter: (box) => {
          return box.get('count') < 10
        }
      })
    })
  .filter((box) => {
    return box.get('count') >= 10
  })
  .doto((box) => {
    console.log('Result:', box.get('count'));
  })
  .drive();

pipeline
  .push(new Box({
    count: 0
  }));
