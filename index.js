#!/usr/bin/env node
'use strict';

// Imports - Local
let Cli = require('./lib/cli');

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(args) {
  let cli = new Cli();
  cli.run(args);
}
