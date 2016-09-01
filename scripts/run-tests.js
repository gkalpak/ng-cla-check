'use strict';

// Imports
let fs = require('fs');
let minimist = require('minimist');
let path = require('path');
let spawn = require('child_process').spawn;

// Exports
module.exports = runTests;

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  args = minimist(args);

  let testType = getTestType(args);
  let watch = args.watch;

  runTests(testType, watch);
}

function debounce(fn, delay) {
  let timer = null;
  let context = null;
  let args = [];

  return debounced;

  // Helpers
  function debounced() {
    context = this;
    args = Array.prototype.slice.call(arguments);

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      fn.apply(context, args);
    }, delay);
  }
}

function getTestType(args) {
  let candidateTestTypes = ['unit', 'e2e'];
  let requestedTestTypes = candidateTestTypes.filter(type => args[type]);

  if (requestedTestTypes.length !== 1) {
    console.error(`You must specify exactly ONE test-type, not ${requestedTestTypes.length}!`);
    process.exit(1);
  }

  return requestedTestTypes[0];
}

function runTests(testType, watch) {
  let watcher = null;

  if (watch) {
    let rootDir = path.join(__dirname, '..');
    let config = {persistent: true, recursive: true};
    let onChange = debounce(runTestsOnce, 1000).bind(null, testType, true);

    watcher = fs.watch(rootDir, config, onChange);
  }

  runTestsOnce(testType, watch);

  return watcher;
}

function runTestsOnce(testType, keepRunning) {
  let executable = process.argv[0];
  let args = [path.join(__dirname, '_run-tests-once'), `"${path.join('test', testType)}"`];
  let proc = spawn(executable, args, {stdio: 'inherit'});

  console.log('-'.repeat(50));

  proc.on('exit', (code, signal) => {
    if (keepRunning) {
      console.log();
    } else {
      process.exit(code || signal || 0);
    }
  });
}
