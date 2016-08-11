'use strict';

// Imports
let pkg = require('../package.json');

// Classes
class Config {
  // Constructor
  constructor() {
    let ghTokenVar = 'GITHUB_ACCESS_TOKEN';
    let defClaLabel = 'cla: yes';
    let defRepo = 'angular/angular.js';
    let usageMessage =
        `  USAGE: ${pkg.name} <PRNO> [--repo="<REPO>"] [--claLabel="<CLA_LABEL>"]\n` +
        `         (Defaults: REPO="${defRepo}", CLA_LABEL="${defClaLabel}")\n\n` +
        `         To use a GitHub access-token, make it available in the env as '${ghTokenVar}'.`;

    this.defaults = {
      claLabel: defClaLabel,
      repo: defRepo
    };

    this.ghTokenVar = ghTokenVar;

    this.usageMessage = usageMessage;
  }
}

// Exports
module.exports = Config;
