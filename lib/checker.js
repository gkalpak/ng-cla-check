'use strict';

// Imports
let ngMaintainUtils = require('@gkalpak/ng-maintain-utils');
let https = require('https');

let Logger =ngMaintainUtils.Logger;

// Classes
class Checker {
  // Constructor
  constructor(options, quiet) {
    // Import `Config` lazily, to avoid import loop.
    let Config = require('./config');
    let defaults = (new Config).defaults;

    this._logger = new Logger();
    this._options = {
      ghToken: this._initializeGhToken(options),
      claLabel: (options && options.claLabel) || defaults.claLabel,
      repo: (options && options.repo) || defaults.repo
    };
    this._quiet = !!quiet;
  }

  // Methods - Protected
  _checkLabels(prData) {
    let claLabel = this._options.claLabel;

    return new Promise((resolve, reject) => {
      let labels = prData.labels;
      let claOk = labels && labels.some(label => label.name === claLabel);

      (claOk ? resolve : reject)();
    });
  }

  _initializeGhToken(options) {
    let ghToken = (options || {}).ghToken;

    if (!ghToken && (ghToken !== false)) {
      let ghTokenVar = Checker.getGhTokenVar();
      ghToken = process.env[ghTokenVar];
    }

    return ghToken;
  }

  _requestData(prNo) {
    let ghToken = this._options.ghToken;
    let repo = this._options.repo;
    let quiet = this._quiet;

    return new Promise((resolve, reject) => {
      let response = '';
      let options = {
        hostname: 'api.github.com',
        path: `/repos/${repo}/issues/${prNo}`,
        headers: {
          'User-Agent': 'Node'
        }
      };
      let cb = res => res.
        on('data', data => response += data).
        on('end', () => resolve(JSON.parse(response))).
        on('error', reject);

      if (ghToken) {
        options.headers.Authorization = `token ${ghToken}`;
      } else if (!quiet) {
        this._logger.warn('No GitHub access-token specified. Proceeding anonymously...');
      }

      https.
        get(options, cb).
        on('error', reject);
    });
  }

  // Methods - Public, Static
  static getGhTokenVar() {
    return 'GITHUB_ACCESS_TOKEN';
  }

  // Methods - Public
  check(prNo) {
    return this._requestData(prNo).
      then(prData => this._checkLabels(prData));
  }
}

// Exports
module.exports = Checker;
