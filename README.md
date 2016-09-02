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

## Testing

The following test-types/modes are available:

- **Code-linting:** `npm run lint`  
  _Lint JavaScript files using ESLint._

- **Unit tests:** `npm run test-unit`  
  _Run all the unit tests once. These tests are quick and suitable to be run on every change._

- **E2E tests:** `npm run test-e2e`  
  _Run all the end-to-end tests once. These test may hit actual API endpoints and are considerably
  slower than unit tests._

- **All tests:** `npm test` / `npm run test`  
  _Run all of the above tests (code-linting, unit tests, e2e tests). This command is automatically
  run before `npm publish`._

- **"Watch" mode:** `npm run test-watch`  
  _Watch all files and rerun the unit tests whenever something changes. For performance reasons
  code-linting or e2e tests are omitted._
