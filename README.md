# ng-cla-check

## Description

A simple utility to check if an AngularJS PR has the `cla: yes` label.

## Usage

### Using in the command-line

```shell
# Show usage instructions
ng-cla-check --usage

# Check a PR
ng-cla-check 12345
```

You can optionally specify the GitHub repo and/or CLA label to check for (by default
`angular/angular.js` and `cla: yes` respectively):

```shell
# Use non-default repo and CLA label
ng-cla-check 12345 --repo="some-user/some-repo" --claLabel="some text"
```

**Note:** To use a GitHub access-token, make it available in an environment variables names
`GITHUB_ACCESS_TOKEN`.

### Using in other modules

```js
let Checker = require('ng-cla-check');
let checker = new Checker({
  ghToken: '...',   // If omitted, requests to the GitHub API will be rate limited.
  claLabel: '...',
  repo: '...'
}, quit);   // Pass true, to avoid any logging to the console.

checker.check(prNo).then(
    () => { /* CLA verified successfully. */ },
    err => {
      /* Unable to verify CLA... */
      if (err) {
        /* ...because an error occurred (e.g. network error, authentication error etc). */
      } else {
        /* ...because it was probably not signed. */
      }
    });
```
