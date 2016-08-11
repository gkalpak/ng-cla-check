#!/usr/bin/env node
'use strict';

// Imports
let minimist = require('minimist');

// Imports - Local
let Checker = require('./lib/checker');
let Config = require('./lib/config');

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  let config = new Config();
  let input = getAndValidateInput(args, config);

  if (input.usage) return displayUsage(config);

  let checker = new Checker({
    ghToken: input.ghToken,
    claLabel: input.claLabel,
    repo: input.repo
  });

  checker.
    check(input.prNo).
    then(onSuccess, onError);
}

function displayUsage(config) {
  console.log(`\n ${config.usageMessage}`);
}

function getAndValidateInput(args, config) {
  args = removeSurroundingQuotes(minimist(args));
  if (args.usage) return {usage: true};

  let ghToken = process.env[config.ghTokenVar] || null;
  let claLabel = args.claLabel || config.defaults.claLabel;
  let repo = args.repo || config.defaults.repo;
  let prNo = args._[0] || onError(`No PR specified\n\n${config.usageMessage}`);

  return {ghToken, claLabel, repo, prNo};
}

function onError(err) {
  if (err) console.error(`\n  ERROR: ${err}\n`);

  reportAndExit(1);
}

function onSuccess() {
  reportAndExit(0);
}

function removeSurroundingQuotes(args) {
  Object.keys(args).forEach(key => {
    let value = args[key];

    if (typeof value === 'string') {
      args[key] = value.
        replace(/^"([^"]*)"$/, '$1').
        replace(/^'([^']*)'$/, '$1');
    }
  });

  return args;
}

function reportAndExit(exitCode) {
  let message = exitCode ?
      ':(  Unable to verify the CLA signature!' :
      ':)  CLA signature verified successfully!';

  console.log(message);
  process.exit(exitCode || 0);
}
