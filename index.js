#!/usr/bin/env node

'use strict';

// Imports
const https = require('https');

// Constants
const GH_HOST = 'api.github.com';
const GH_PATH = '/repos/angular/angular.js/issues/';
const GH_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const CLA_LABEL = 'cla: yes';

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  const prNo = args[0];

  getInfo(prNo).
    then(checkLabels).
    catch(onError).
    then(reportAndExit);
}

function checkLabels(json) {
  const promise = new Promise((resolve, reject) => {
    const labels = JSON.parse(json).labels;
    const claOk = labels && labels.some(label => label.name === CLA_LABEL);

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
      path: `${GH_PATH}${prNo}`,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
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

function onError(err) {
  if (err) console.error('ERROR:', err);

  return true;
}

function reportAndExit(withError) {
  const exitCode = withError ? 1 : 0;
  const message = withError ?
      ':(  Unable to verify the CLA signature !' :
      ':)  CLA signature verified successfully !';

  console.log(message);
  process.exit(exitCode);
}
