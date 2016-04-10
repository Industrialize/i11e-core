const _ = require('../index').prodline;

var buffer = [1, 2, 3];

_((push, next) => {
  if (buffer.length > 0) {
    push(null, buffer.shift());
  }

  process.nextTick(next);
})
.doto((v) => {
  console.log(v);
})
.drive();


buffer.push(4);
