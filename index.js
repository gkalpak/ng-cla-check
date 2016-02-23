#!/usr/bin/env node

'use strict';

// Imports
const https = require('https');

// Constants
const GH_HOST = 'api.github.com';
const GH_PATH = '/repos/angular/angular.js/issues/';
const CLA_LABEL = 'cla: yes';

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const prNo = args[0];

  getInfo(prNo).
    then(checkLabels).
    catch(e => {
      if (e) console.error(e);
      process.exit(1);
    });
}

function checkLabels(json) {
  const promise = new Promise((resolve, reject) => {
    const labels = JSON.parse(json).labels;
    const claOk = labels.some(label => label.name === CLA_LABEL);

    (claOk ? resolve : reject)();
  });

  return promise;
}

function getInfo(prNo) {
  const promise = new Promise((resolve, reject) => {
    let data = '';

    const options = {
      method: 'GET',
      hostname: GH_HOST,
      path: GH_PATH + prNo,
      headers: {
        'User-Agent': 'Node'
      }
    };

    const req = https.request(options, res => {
      res.on('data', d => data += d);
      res.on('end', _ => resolve(data));
    });

    req.end();
    req.on('error', reject);
  });

  return promise;
}
