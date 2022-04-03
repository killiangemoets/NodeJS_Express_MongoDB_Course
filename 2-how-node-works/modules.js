// console.log(arguments);
// arguments in a array in JavaScript that containes all the values that were passed into a function

// console.log(require("module").wrapper);

//module.exports
const C = require("./test-module-1");
const calc1 = new C();
console.log(calc1.add(2, 4));

//exports
// const calc2 = require("./test-module-2");
// console.log(calc2.add(3, 5));

const { add, multiply } = require("./test-module-2");
console.log(add(3, 5));

// caching
// if we want we don't need to store the function into a variable but we can call it directly.
require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
