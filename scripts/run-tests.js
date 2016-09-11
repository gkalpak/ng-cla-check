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

  let testType = args.type || '';
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

function onWatchEventGen(cb) {
  let ignoredDirsRe = /^(\..+|node_modules)$/;
  let onWatchEvent = (_, filepath) => {
    let dirs = path.dirname(filepath).split(path.sep);

    if (!dirs.some(dir => ignoredDirsRe.test(dir))) {
      fs.stat(filepath, (err, stats) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            console.error('ERROR:', err.message, err.stack);
          } else {
            cb();
          }
        } else if (stats.isFile()) {
          cb();
        }
      });
    }
  };

  return onWatchEvent;
}

function runTests(testType, watch) {
  let doRunTests = () => runTestsOnce(testType, watch);
  let watcher = null;

  if (watch) {
    let debouncedDoRunTests = debounce(doRunTests, 1000);

    let rootDir = path.join(__dirname, '..');
    let config = {persistent: true, recursive: true};
    let onEvent = onWatchEventGen(debouncedDoRunTests);

    watcher = fs.watch(rootDir, config, onEvent);
  }

  doRunTests();

  return watcher;
}

function runTestsOnce(testType, keepRunning) {
  let executable = process.execPath;
  let args = [path.join(__dirname, '_run-tests-once'), `${path.join('test', testType)}`];
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
