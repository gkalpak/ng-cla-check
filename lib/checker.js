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
      let headers = {'User-Agent': 'Node'};
      let options = {
        method: 'GET',
        hostname: 'api.github.com',
        path: `/repos/${repo}/issues/${prNo}`,
        headers
      };

      if (ghToken) {
        headers['Authorization'] = `token ${ghToken}`;
      } else if (!quiet) {
        console.warn('No GitHub access-token specified. Proceeding anonymously...');
      }

      let req = https.request(options, res => {
        res.on('data', data => response += data);
        res.on('end', () => resolve(JSON.parse(response)));
      });

      req.end();
      req.on('error', reject);
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
