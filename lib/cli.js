'use strict';

// Imports
let ngMaintainUtils = require('@gkalpak/ng-maintain-utils');

let AbstractCli = ngMaintainUtils.AbstractCli;

// Imports - Local
let Checker = require('./checker');
let Config = require('./config');

// Classes
class Cli extends AbstractCli {
  // Constructor
  constructor() {
    super(new Config());
  }

  // Methods - Protected
  _displayExperimentalTool() {}

  _displayHeader() {}

  _displayInstructions() {
    this._logger.log('WARNING: Unsupported argument (`instructions`).');
  }

  _insertEmptyLine() {}

  _theHappyEnd(value) {
    this._logger.log(':)  CLA signature verified successfully!');

    return value;
  }

  _theUnhappyEnd(err) {
    this._logger.log(':(  Unable to verify the CLA signature!');

    return super._theUnhappyEnd(err);
  }

  // Methods - Public
  getPhases() { return []; }

  run(rawArgs) {
    let doWork = input => Promise.resolve().
      then(() => new Checker({claLabel: input.claLabel, repo: input.repo})).
      then(checker => this._checker = checker).
      then(checker => checker.check(input.prNo));

    return super.run(rawArgs, doWork);
  }
}

// Exports
module.exports = Cli;
