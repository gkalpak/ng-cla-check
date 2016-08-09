#!/usr/bin/env node
'use strict';

// Imports
let ngClaCheck = require('./index');

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  let prNo = args[0];

  ngClaCheck(prNo).
    catch(onError).
    then(reportAndExit);
}

function onError(err) {
  if (err) console.error('ERROR:', err);

  return true;
}

function reportAndExit(withError) {
  let exitCode = withError ? 1 : 0;
  let message = withError ?
      ':(  Unable to verify the CLA signature!' :
      ':)  CLA signature verified successfully!';

  console.log(message);
  process.exit(exitCode);
}
