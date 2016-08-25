'use strict';

// Imports - Local
let pkg = require('../package.json');

// Variables - Private
let executable = Object.keys(pkg.bin)[0];
let defClaLabel = 'cla: yes';
let defRepo = 'angular/angular.js';
let ghTokenVar = 'GITHUB_ACCESS_TOKEN';
let usageMessage =
    `  USAGE: ${executable} <PRNO> [--repo="<REPO>"] [--claLabel="<CLA_LABEL>"]\n` +
    `         (Defaults: REPO="${defRepo}", CLA_LABEL="${defClaLabel}")\n\n` +
    `         To use a GitHub access-token, make it available in the env as '${ghTokenVar}'.`;

// Exports
module.exports = {
  defaults: {
    claLabel: defClaLabel,
    repo: defRepo
  },
  ghTokenVar: ghTokenVar,
  usageMessage: usageMessage
};
