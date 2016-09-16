'use strict';

// Imports
let minimist = require('minimist');

// Imports - Local
let Checker = require('./checker');
let config = require('./config');

// Classes
class Cli {
  // Methods - Protected
  _displayUsage() {
    console.log(`\n${config.usageMessage}`);
  }

  _getAndValidateInput(args) {
    args = this._removeSurroundingQuotes(minimist(args, {boolean: true}));
    if (args.usage) return {usage: true};

    let claLabel = args.claLabel || null;
    let repo = args.repo || null;
    let prNo = args._[0];

    if (repo && (repo.indexOf('/') === -1)) {
      this._onError('Invalid repo. Make sure to include the username ' +
                    `(e.g. '${config.defaults.repo}').`);
    } else if (!prNo) {
      this._onError(`No PR specified\n\n${config.usageMessage}`);
    }

    return {claLabel, repo, prNo};
  }

  _onError(err) {
    if (err) console.error(`\n  ERROR: ${err}\n`);

    this._reportAndExit(1);
  }

  _onSuccess() {
    this._reportAndExit(0);
  }

  _removeSurroundingQuotes(args) {
    Object.keys(args).forEach(key => {
      let value = args[key];

      if (typeof value === 'string') {
        let match = /^"([^"]*)"$/.exec(value) || /^'([^']*)'$/.exec(value);
        args[key] = !match ? value : match[1];
      }
    });

    return args;
  }

  _reportAndExit(exitCode) {
    let message = exitCode ?
        ':(  Unable to verify the CLA signature!' :
        ':)  CLA signature verified successfully!';

    console.log(message);
    process.exit(exitCode || 0);
  }

  // Methods - Public
  run(args) {
    let input = this._getAndValidateInput(args);

    if (input.usage) {
      this._displayUsage();
      process.exit(0);
    }

    let checker = new Checker({
      claLabel: input.claLabel,
      repo: input.repo
    });

    return checker.
      check(input.prNo).
      then(() => this._onSuccess(), err => this._onError(err));
  }
}

// Exports
module.exports = Cli;
