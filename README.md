# tinybench

<div align="center">

[![Build Status](https://github.com/tinylib/tinylib/workflows/ci/badge.svg)](https://github.com/tinylib/tinylib/actions)
[![Coverage Status](https://coveralls.io/repos/github/tinylib/tinylib/badge.svg?branch=master)](https://coveralls.io/github/tinylib/tinylib?branch=master)

</div>

A [robust](https://mathiasbynens.be/notes/javascript-benchmarking "Bulletproof JavaScript benchmarks") benchmarking library based on benchmark.js

## Documentation

* [API Documentation](https://benchmarkjs.com/docs)

## Installation

Using npm:

```shell
$ npm i --save tinylib
```

Optionally, use the [microtime module](https://github.com/wadey/node-microtime) by Wade Simmons:

```shell
npm i --save microtime
```

Usage example:

```js
var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

// add tests
suite.add('RegExp#test', function() {
  /o/.test('Hello World!');
})
.add('String#indexOf', function() {
  'Hello World!'.indexOf('o') > -1;
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });

// logs:
// => RegExp#test x 4,161,532 +-0.99% (59 cycles)
// => String#indexOf x 6,139,623 +-1.00% (131 cycles)
// => Fastest is String#indexOf
```
