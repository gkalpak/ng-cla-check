# ng-cla-check

## Description

A simple utility to check if an AngularJS PR has the `cla: yes` label.

## Usage

Using in the command-line:

```shell
ng-cla-check 12345
```

Using in other modules:

```js
let ngClaCheck = require('ng-cla-check');
ngClaCheck(12345).then(
    () => { /* CLA verified successfully */ },
    err => {
      /* Unable to verify CLA... */
      if (err) {
        /* ...because an error occurred (e.g. network error, authentication error etc) */
      } else {
        /* ...because it was probably not signed */
      }
    });
```
