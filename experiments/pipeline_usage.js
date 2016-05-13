const i11e = require('../index');
const createPipeline = i11e.createPipeline;
const Box = i11e.Box;

// create first pipeline
var IncPipeline = createPipeline({
  process() {
    return this.source._()
      .gp((box, done) => {
        if (!box.has('v')) {
          box.set('v', 0);
        } else {
          box.set('v', box.get('v') + 1);
        }

        done(null, box);
      });
  }
});

var DoublePipeline = createPipeline({
  process() {
    return this.source._()
      .gp((box, done) => {
        var v = box.get('v');

        box.set('v', v * 2);

        done(null, box);
      });
  }
});

var TriplePipeline = createPipeline({
  process() {
    return this.source._()
      .gp((box, done) => {
        var v = box.get('v');

        box.set('v', v * 3);

        done(null, box);
      });
  }
});

var divide2PL = i11e.pipeline((source) =>
  source._()
    .gp((box, done) => {
      var v = box.get('v');

      box.set('v', v / 2);

      done(null, box);
    })
);


// ----------------------------------------------------------------------------
// Single pipeline usage
// ----------------------------------------------------------------------------
// var incPL = IncPipeline();
// // get result from the tail
// incPL._().each((box) => {
//   console.log(box.get('v'));
// });
// // push input to the head
// incPL.$().push(new Box({
//   v: 1
// }));

// ----------------------------------------------------------------------------
// joint pipeline usage
// ----------------------------------------------------------------------------

// var incPL = IncPipeline();
// var doublePL = DoublePipeline();
//
// // join the two pipelines, incPL's tail to doublePL's head
// incPL._().doto((box) => {
//   doublePL.$().push(box);
// }).drive();
//
//
// // get result from doublePL's tail
// doublePL._().each((box) => {
//   console.log(box.get('v'));
// });
//
// // push input to the incPL's head
// incPL.$().push(new Box({
//   v: 1
// }));


// ----------------------------------------------------------------------------
// joint pipeline usage with prodline
// ----------------------------------------------------------------------------
var incPL = new IncPipeline();
var doublePL = new DoublePipeline();
var triplePL = new TriplePipeline();

// join the two pipelines, incPL's tail to doublePL's head
i11e.join(incPL, doublePL, {
  tags: {
    "glossary": {v: 'u'}
  }
});
i11e.join(incPL, triplePL);

/*

  box --> incPL --> | --> doublePL --> print
                    | --> triplePL --> print
 */

incPL._().drive();

// get result from doublePL's tail
doublePL._().each((box)=>{
  box.print();
});

triplePL._().each((box)=>{
  box.print();
});

// push input to the incPL's head
incPL.$().push(new Box({
  v: 1,
  u: 10
}));

divide2PL._().each((box) => {
  box.print();
});

divide2PL.$().push({
  v: 10
});
