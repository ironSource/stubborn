## Stubborn

### Install
```sh
npm install stubborn
```

### Example
```js
var Stubborn = require('stubborn');

var options = {
  maxAttemps: 5,
  delay: 1000
};

var stubborn = new Stubborn(task, options, callback);

stubborn.on('error', onError);

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

function onError(err) {
  console.error(err);
}

```

## Events
 * run
 * error
 * schedule
