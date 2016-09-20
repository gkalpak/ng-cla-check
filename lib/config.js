'use strict';

// Imports
let ngMaintainUtils = require('@gkalpak/ng-maintain-utils');

let ArgSpec = ngMaintainUtils.ArgSpec;
let ConfigBase = ngMaintainUtils.Config;

// Imports - Local
let Checker = require('./checker');
let pkg = require('../package.json');

// Variables - Private
let executable = Object.keys(pkg.bin)[0];
let defClaLabel = 'cla: yes';
let defRepo = 'angular/angular.js';
let ghTokenVar = Checker.getGhTokenVar();
let usageMessage =
    `  USAGE: ${executable} <PRNO> [--repo="<REPO>"] [--claLabel="<CLA_LABEL>"]\n` +
    `         (Defaults: REPO="${defRepo}", CLA_LABEL="${defClaLabel}")\n\n` +
    `         To use a GitHub access-token, make it available in the env as '${ghTokenVar}'.`;
let claLabelValidator = claLabel => (typeof claLabel === 'string') && !!claLabel;
let repoValidator = repo => {
  let tokens = repo.split('/');
  return (tokens.length === 2) && tokens.every(t => t.trim());
};

// Classes
class Config extends ConfigBase {
  constructor() {
    let messages = {
      usage: usageMessage,
      errors: {
        ERROR_emptyClaLabel: 'The CLA label cannot be empty.',
        ERROR_invalidRepo: `Invalid repo. Make sure to include the username (e.g. '${defRepo}').`,
        ERROR_missingPrNo: `No PR specified.\n\n${usageMessage}`
      }
    };

    let argSpecs = [
      new ArgSpec.Unnamed(0, 'prNo', prNo => !!prNo, 'ERROR_missingPrNo'),
      new ArgSpec('repo', repoValidator, 'ERROR_invalidRepo', defRepo),
      new ArgSpec('claLabel', claLabelValidator, 'ERROR_emptyClaLabel', defClaLabel)
    ];

    super(messages, argSpecs);
  }
}

// Exports
module.exports = Config;
