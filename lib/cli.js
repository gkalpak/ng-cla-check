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

  _displayInstructions() {}

  _theEnd(value) {
    console.log(':)  CLA signature verified successfully!');
    return value;
  }

  _theUnhappyEnd() {
    console.log(':(  Unable to verify the CLA signature!');
    return Promise.reject();
  }

  // Methods - Public
  getPhases() { return []; }

  run(rawArgs) {
    let doWork = input => Promise.resolve().
      then(() => new Checker({claLabel: input.claLabel, repo: input.repo})).
      then(checker => this._checker = checker).
      then(checker => checker.check(input.prNo).catch(() => this._theUnhappyEnd()));

    return super.
      run(rawArgs, doWork).
      catch(err => err ?
          this._uiUtils.reportAndRejectFnGen('ERROR_unexpected')(err) :
          Promise.reject());
  }
}

// Exports
module.exports = Cli;
