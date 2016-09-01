'use strict';

// Imports
let https = require('https');

// Imports - Local
let config = require('./config');

// Classes
class Checker {
  // Constructor
  constructor(opts, quiet) {
    if (!opts) opts = {};

    let ghToken = opts.ghToken || ((opts.ghToken !== false) && process.env[config.ghTokenVar]);
    let claLabel = opts.claLabel || config.defaults.claLabel;
    let repo = opts.repo || config.defaults.repo;

    this._options = {ghToken, claLabel, repo};
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
        console.warn('No GitHub access-token specified. Proceeding anonymously...');
      }

      https.
        get(options, cb).
        on('error', reject);
    });
  }

  // Methods - Public
  check(prNo) {
    return this._requestData(prNo).
      then(prData => this._checkLabels(prData));
  }
}

// Exports
module.exports = Checker;
