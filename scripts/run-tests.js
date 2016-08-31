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
  let watch = minimist(args).watch;
  runTests(watch);
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

function ignoreFile(filename) {
  return filename.indexOf('node_modules' + path.sep) === 0;
}

function runTests(watch) {
  let watcher = null;

  if (watch) {
    let rootDir = path.join(__dirname, '..');
    let config = {persistent: true, recursive: true};
    let debouncedRunTestsOnce = debounce(runTestsOnce, 1000);

    watcher = fs.watch(rootDir, config, (_, filename) => {
      if (!ignoreFile(filename)) {
        debouncedRunTestsOnce(true);
      }
    });
  }

  runTestsOnce(watch);

  return watcher;
}

function runTestsOnce(keepRunning) {
  let executable = process.argv[0];
  let args = [path.join(__dirname, '_run-tests-once')];
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
