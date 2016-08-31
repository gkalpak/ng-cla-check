'use strict';

// Imports
let Jasmine = require('jasmine');
let util = require('util');

// Constants
const JASMINE_CONFIG = {
  random: true,
  spec_dir: 'test',
  spec_files: [
    '**/*.spec.js'
  ]
};

// Run
_main();

// Functions - Definitions
function _main() {
  let runner = new Jasmine();
  let reporter = createConsoleReporter(runner);

  runner.loadConfig(JASMINE_CONFIG);
  runner.addReporter(reporter);
  runner.execute();
}

function createConsoleReporter(runner) {
  let options = {
    jasmineCorePath: runner.jasmineCorePath,
    print: function print() {
      process.stdout.write(util.format.apply(this, arguments));
    },
    showColors: true,
    timer: new runner.jasmine.Timer()
  };

  return new Jasmine.ConsoleReporter(options);
}
