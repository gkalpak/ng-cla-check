'use strict';

// Constants
const GH_HOST = 'api.github.com';
const GH_PATH = '/repos/angular/angular.js/issues/';
const GH_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const CLA_LABEL = 'cla: yes';

// Imports
let https = require('https');

// Exports
module.exports = ngClaCheck;

// Functions - Definitions
function checkLabels(json) {
  return new Promise((resolve, reject) => {
    let labels = JSON.parse(json).labels;
    let claOk = labels && labels.some(label => label.name === CLA_LABEL);

    (claOk ? resolve : reject)();
  });
}

function ngClaCheck(prNo) {
  return requestData(prNo).then(checkLabels);
}

function requestData(prNo) {
  return new Promise((resolve, reject) => {
    let data = '';
    let options = {
      method: 'GET',
      hostname: GH_HOST,
      path: `${GH_PATH}${prNo}`,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'User-Agent': 'Node'
      }
    };

    let req = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    });

    req.end();
    req.on('error', reject);
  });
}
