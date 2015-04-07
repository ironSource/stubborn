## Stubborn

### Install
```sh
npm install stubborn
```

### Example
```js
var Stubborn = require('stubborn');

var options = {
  maxAttempts: 5,
  delay: 1000
};

var stubborn = new Stubborn(task, options, callback);

stubborn.on('attemptError', onAttemptError);

stubborn.run();

function task(callback) {
  if (Math.random() > 0.2) {
    callback('Task error');
  } else {
    callback(null, 'Task result');
  }
}

function callback(err, result) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(result);
}

function onAttemptError(err) {
  console.error(err);
}

```
### pluggable retry algorithm
All retry algorithms need the current number of attempts as input. As output, they are expected to produce a number that will be used as a factor of the delay.
```js
var Stubborn = require('stubborn');

var options = {
  maxAttempts: 5,
  delay: 1000,
  retryAlgorithm: Stubborn.exponentialBackoff()
};

var stubborn = new Stubborn(task, options, callback);

```
#### implement your own:
```js

var options = {
  maxAttempts: 5,
  delay: 1000,
  retryAlgorithm: function(attempts) {
    // delay next execution in options.delay * attempts * 2 
    // thus in attempt #2 we'll have 1000ms * 2 * 2 = 4 seconds delay
    return attempts * 2
  }
};
``` 
#### out of the box algorithms:
```
var Stubborn = require('stubborn');

var algo1 = Stubborn.exponentialBackoff(2)       // classic http://en.wikipedia.org/wiki/Exponential_backoff
var algo2 = Stubborn.simpleExponentialBackoff(2) // same as the above only without the random element
var algo3 = Stubborn.logarithmicProgression(2)   // logarithmic progression
var algo4 = Stubborn.linear(1, 0)                // ax+b
var algo5 = Stubborm.constant(1)                 // constant / fixed progression
```
#### configure using names instead of functions
```js
var options = {
  retryAlgorithm: 'linear',
  retryAlgorithmArgs: [ 1, 0 ]
}
```
### Methods
 * ```run``` starts specified task, call it only once
 * ```cancel``` stops retries

### Events
 * ```run```
 * ```onAttemptError```
 * ```schedule```
