var start = process.hrtime();

var i = 0;
for (i = 0; i < 10; i++) {
  console.log('Loop:', i);
}

console.log('Result:', i);
var diff = process.hrtime(start);
console.log('>> time elapsed:', diff[0] * 1000 + diff[1] / 1000000, 'ms <<');
