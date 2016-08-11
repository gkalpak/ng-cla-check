'use strict';

// Imports
let https = require('https');

// Classes
class Checker {
  // Constructor
  constructor(config, quiet) {
    this.config = config;
    this.quiet = !!quiet;
  }

  // Methods - Protected
  _checkLabels(prData) {
    let claLabel = this.config.claLabel;

    return new Promise((resolve, reject) => {
      let labels = prData.labels;
      let claOk = labels && labels.some(label => label.name === claLabel);

      (claOk ? resolve : reject)();
    });
  }

  _requestData(prNo) {
    let ghToken = this.config.ghToken;
    let repo = this.config.repo;
    let quiet = this.quiet;

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
        on('end', () => resolve(JSON.parse(response)));

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
