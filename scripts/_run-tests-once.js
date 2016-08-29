'use strict';

// Imports
let Jasmine = require('jasmine');

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

  runner.loadConfig(JASMINE_CONFIG);
  runner.execute();
}
