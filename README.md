# ng-cla-check

## Description

A simple utility to check if an AngularJS PR has the `cla: yes` label.

## Usage

### Using from the command-line

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

**Note:** To use a GitHub access-token, make it available in an environment variable named
`GITHUB_ACCESS_TOKEN`.

### Using from other modules

```js
let Checker = require('ng-cla-check');
let checker = new Checker(/* Use default options */);

checker.check(prNo).then(
    () => {
      // CLA verified successfully.
    },
    err => {
      // Unable to verify CLA...
      if (err) {
        // ...because an error occurred (e.g. network error, authentication error etc).
      } else {
        // ...because it was probably not signed.
      }
    });
```

You can also pass custom `ghToken`, `claLabel` or `repo` options:

```js
let checker = new Checker({
  ghToken: '...',   // Pass `false` to force anonymous (rate-limited) requests to the GitHub API.
  claLabel: 'some text',
  repo: 'some-user/some-repo'
});
```

Finally, you can prevent the `checker` from logging any messages to the console (e.g. warn when no
GitHub access-token is available), by passing `true` as the second argument:

```js
let quiet = true;
let checker = new Checker(null, quiet);
```
