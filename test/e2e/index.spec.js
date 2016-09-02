'use strict';

// Imports
let childProcess = require('child_process');
let path = require('path');

// Imports - Local
let config = require('../../lib/config');

// Tests
describe('index', () => {
  let exec = childProcess.exec;
  let nodeExec = path.basename(process.argv[0]);
  let indexScript = require.resolve('../../index');

  describe('--usage', () => {
    it('should display the usage instructions', done => {
      let cmd = `${nodeExec} "${indexScript}" --usage`;

      exec(cmd, null, (err, stdout) => {
        expect(err).toBe(null);
        expect(stdout).toContain(config.usageMessage);

        done();
      });
    });
  });

  describe('--no-usage', () => {
    // Only run the tests if a GitHub access-token is available
    if (!process.env.hasOwnProperty(config.ghTokenVar)) {
      console.warn('\n  No GitHub access-token available. Skipping `index --no-usage` tests...\n');
      return;
    }

    let verifyError = (err, stdout) => {
      expect(err).toEqual(jasmine.any(Error));
      expect(stdout).toContain(':(');
    };
    let verifySuccess = (err, stdout) => {
      expect(err).toBe(null);
      expect(stdout).toContain(':)');
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

            let cmd = `${nodeExec} "${indexScript}" ${prNo}`;
            if (claLabel) cmd += ` --claLabel=${claLabel}`;
            if (repo) cmd += ` --repo=${repo}`;

            let verify = pass ? verifySuccess : verifyError;

            it(description, done => {
              exec(cmd, null, (err, stdout) => {
                verify(err, stdout);
                done();
              });
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
