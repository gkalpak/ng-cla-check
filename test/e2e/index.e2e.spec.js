'use strict';

// Imports
let childProcess = require('child_process');

// Imports - Local
let Checker = require('../../lib/checker');
let Config = require('../../lib/config');

// Tests
describe('index', () => {
  let spawn = childProcess.spawn;
  let indexScript = require.resolve('../../index');
  let config;

  beforeEach(() => {
    config = new Config();
  });

  describe('--version', () => {
    it('should display the correct version info', done => {
      runWith(['--version']).
        then(response => {
          expect(response.code).toBe(0);
          expect(response.stderr).toBe('');
          expect(response.stdout).toContain('@gkalpak/ng-cla-check');
          expect(response.stdout).toContain(config.versionInfo.version);
        }).
        then(done);
    });
  });

  describe('--usage', () => {
    it('should display the usage instructions', done => {
      runWith(['--usage']).
        then(response => {
          expect(response.code).toBe(0);
          expect(response.stderr).toBe('');
          expect(response.stdout).toContain(config.messages.usage);
        }).
        then(done);
    });
  });

  describe('--instructions', () => {
    it('should not display anything', done => {
      runWith(['12345', '--instructions']).
        then(response => {
          expect(response.code).toBe(0);
          expect(response.stderr).toBe('');
          expect(response.stdout).toBe('');
        }).
        then(done);
    });
  });

  describe('--no-usage --no-instructions', () => {
    describe('- Incorrect usage', () => {
      it('should error if the repo is invalid', done => {
        runWith(['12345', '--repo=baz\\qux']).
          then(response => {
            expect(response.code).toBe(1);
            expect(response.stdout).toBe('');
            expect(response.stderr).toContain('ERROR: Invalid repo');
            expect(response.stderr).toContain('Make sure to include the username');
            expect(response.stderr).toContain(config.defaults.repo);
          }).
          then(done);
      });

      it('should error if the CLA label is invalid', done => {
        let promises = ['--claLabel', '--claLabel='].map(claLabelArg => {
          return runWith(['12345', claLabelArg]).
            then(response => {
              expect(response.code).toBe(1);
              expect(response.stdout).toBe('');
              expect(response.stderr).toContain('ERROR: The CLA label cannot be empty');
            });
        });

        Promise.
          all(promises).
          then(done);
      });

      it('should error if no PR is specified (and display the usage instructions)', done => {
        runWith([]).
          then(response => {
            expect(response.code).toBe(1);
            expect(response.stdout).toBe('');
            expect(response.stderr).toContain('ERROR: No PR specified');
            expect(response.stderr).toContain(config.messages.usage);
          }).
          then(done);
      });
    });

    describe('- Correct usage', () => {
      // Only run the tests if a GitHub access-token is available
      if (!process.env.hasOwnProperty(Checker.getGhTokenVar())) {
        console.warn('\n  No GitHub access-token available. ' +
                     'Skipping `index --no-usage --no-instructions` tests...\n');
        return;
      }

      let verifyError = response => {
        expect(response.code).not.toBe(0);
        expect(response.stderr).toBe('');
        expect(response.stdout).toContain(':(');
      };
      let verifySuccess = response => {
        expect(response.code).toBe(0);
        expect(response.stderr).toBe('');
        expect(response.stdout).toContain(':)');
      };

      createSpecs().forEach(outerSpec => {
        describe(outerSpec.description, () => {
          outerSpec.specs.forEach(innerSpec => {
            describe(innerSpec.description, () => {
              let repo = innerSpec.repo || null;
              let claLabel = innerSpec.claLabel || null;
              let prNo = innerSpec.prNo;
              let pass = innerSpec.pass;

              let descriptionPrefix = `should ${pass ? 'verify' : 'not verify'} the CLA signature`;
              let descriptionSuffix = `(repo: ${repo}, claLabel: ${claLabel}, prNo: ${prNo})`;
              let description = `${descriptionPrefix} - ${descriptionSuffix}`;

              let args = [prNo];
              if (claLabel) args.push(`--claLabel=${claLabel}`);
              if (repo) args.push(`--repo=${repo}`);

              let verify = pass ? verifySuccess : verifyError;

              it(description, done => {
                runWith(args).
                  then(verify).
                  then(done);
              });
            });
          });
        });
      });

      // Helpers
      function createSpecs() {
        let inputs = {
          defaultRepo: {
            name: 'angular/angular.js',
            goodPrNo: 9757,
            badPrNo: 9758,
            existingClaLabel: '"component: filters"'
          },
          existingRepo: {
            name: 'angular/angular',
            goodPrNo: 5867,
            existingClaLabel: '"pr_state: LGTM"'
          },
          nonExistingClaLabel: '"foo: bar"',
          nonExistingRepo: {
            name: 'baz/qux'
          }
        };

        return [
          {
            description: 'with default options',
            specs: [
              {
                description: '+ PR with CLA',
                prNo: inputs.defaultRepo.goodPrNo,
                pass: true
              }, {
                description: '+ PR without CLA',
                prNo: inputs.defaultRepo.badPrNo,
                pass: false
              }
            ]
          },
          {
            description: 'with custom `claLabel`',
            specs: [
              {
                description: '(existing)',
                prNo: inputs.defaultRepo.goodPrNo,
                claLabel: inputs.defaultRepo.existingClaLabel,
                pass: true
              },
              {
                description: '(non-existing)',
                prNo: inputs.defaultRepo.goodPrNo,
                claLabel: inputs.nonExistingClaLabel,
                pass: false
              }
            ]
          },
          {
            description: 'with custom `repo`',
            specs: [
              {
                description: '(existing)',
                prNo: inputs.existingRepo.goodPrNo,
                repo: inputs.existingRepo.name,
                pass: true
              },
              {
                description: '(non-existing)',
                prNo: 12345,
                repo: inputs.nonExistingRepo.name,
                pass: false
              }
            ]
          },
          {
            description: 'with custom `claLabel` and `repo`',
            specs: [
              {
                description: '(default)',
                prNo: inputs.defaultRepo.goodPrNo,
                claLabel: inputs.defaultRepo.existingClaLabel,
                repo: inputs.defaultRepo.name,
                pass: true
              },
              {
                description: '(existing)',
                prNo: inputs.existingRepo.goodPrNo,
                claLabel: inputs.existingRepo.existingClaLabel,
                repo: inputs.existingRepo.name,
                pass: true
              }
            ]
          }
        ];
      }
    });
  });

  // Helpers
  function runWith(args) {
    return new Promise(resolve => {
      args.unshift(indexScript);

      let stdout = '';
      let stderr = '';
      let cb = (code, signal) => resolve({code, signal, stdout, stderr});

      let proc = spawn(process.execPath, args).on('exit', cb);
      proc.stdout.on('data', d => stdout += d);
      proc.stderr.on('data', d => stderr += d);
    });
  }
});
