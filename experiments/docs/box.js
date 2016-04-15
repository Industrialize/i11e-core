var i11e = require('../../index');
var Box = i11e.Box;

// -----------------------------------------------------------------------------
// Primitive type data
// -----------------------------------------------------------------------------
console.log('---primitive type test---');
// create a Box with primitive type
var box = new Box(1);

console.log(box.payload()); // ==> 1

// -----------------------------------------------------------------------------
// Object data
// -----------------------------------------------------------------------------
console.log('---object type test---');
var box = new Box({
  intProp: 1,
  objProp: {
    a: {
      b: 'this is string'
    }
  },
  arrayProp: [
    'array item 1',
    {
      'obj': 'array item 2'
    }
  ]
});

console.log(box.get('intProp')); // ==> 1
console.log(box.get('objProp.a.b')); // ==> this is string
console.log(box.get('objProp.a')); // ==> {b: 'this is string'}
console.log(box.get('arrayProp.0')); // ==> array item 1
console.log(box.get('arrayProp.1.obj')); // ==> array item 2

// -----------------------------------------------------------------------------
// Tag
// -----------------------------------------------------------------------------
console.log('---tag test---');
var box = new Box({
  intProp: 1,
  objProp: {
    a: {
      b: 'this is string'
    }
  }
});

box.setGlossaryTag({
  'int': 'intProp',
  'str': 'objProp.a.b'
});

console.log(box.get('int')); // ==> 1
console.log(box.get('str')); // ==> this is string
