'use strict';

// Imports
let ngMaintainUtils = require('@gkalpak/ng-maintain-utils');

let ArgSpec = ngMaintainUtils.ArgSpec;
let ConfigBase = ngMaintainUtils.Config;

// Imports - Local
let Checker = require('../../lib/checker');
let Config = require('../../lib/config');

// Tests
describe('Config', () => {
  let config;

  beforeEach(() => {
    config = new Config();
  });

  it('should extend `ngMaintainUtils.Config`', () => {
    expect(config).toEqual(jasmine.any(Config));
    expect(config).toEqual(jasmine.any(ConfigBase));
  });

  it('should be possible to create independent instances', () => {
    let config2 = new Config();

    expect(config).not.toBe(config2);
    expect(config.messages).not.toBe(config2.messages);

    config.messages.usage = 'foo';
    config2.messages.usage = 'bar';

    expect(config.messages.usage).toBe('foo');
    expect(config2.messages.usage).toBe('bar');
  });

  describe('#argSpecs', () => {
    let argSpecs;

    beforeEach(() => {
      argSpecs = config.argSpecs;
    });

    it('should be an array', () => {
      expect(argSpecs).toBeDefined();
      expect(argSpecs).toEqual(jasmine.any(Array));
    });

    it('should have a spec for `prNo` (ArgSpec.Unnamed)', () => {
      let argSpec = findSpecFor('prNo');

      expect(argSpec).toBeDefined();
      expect(argSpec).toEqual(jasmine.any(ArgSpec.Unnamed));
      expect(argSpec.index).toBe(0);
      expect(argSpec.errorCode).toContain('missingPrNo');
      expect(argSpec.defaultValue).toBeNull();
    });

    it('should have an appropriate validator for `prNo`', () => {
      let validator = findSpecFor('prNo').validator;

      [undefined, null, false, 0, ''].forEach(prNo => {
        expect(validator(prNo)).toBe(false);
      });

      [true, 1, ' ', [], {}, () => {}].forEach(prNo => {
        expect(validator(prNo)).toBe(true);
      });
    });

    it('should have a spec for `repo` (ArgSpec)', () => {
      let argSpec = findSpecFor('repo');

      expect(argSpec).toBeDefined();
      expect(argSpec).toEqual(jasmine.any(ArgSpec));
      expect(argSpec).not.toEqual(jasmine.any(ArgSpec.Unnamed));
      expect(argSpec.errorCode).toContain('invalidRepo');
      expect(argSpec.defaultValue).toBe(config.defaults.repo);
    });

    it('should have an appropriate validator for `repo`', () => {
      let validator = findSpecFor('repo').validator;

      [undefined, null, false, 0, true, 1, {}, () => {}].forEach(repo => {
        expect(() => validator(repo)).toThrowError();
      });

      [
        '', ' ', 'foo', 'foo\\bar',
        '/', ' / ',
        'foo/', 'foo/  ', '/bar', '  /bar',
        'foo/bar/baz'
      ].forEach(repo => {
        expect(validator(repo)).toBe(false);
      });

      ['foo/bar', 'foo-bar/baz qux'].forEach(repo => {
        expect(validator(repo)).toBe(true);
      });
    });

    it('should have a spec for `claLabel` (ArgSpec)', () => {
      let argSpec = findSpecFor('claLabel');

      expect(argSpec).toBeDefined();
      expect(argSpec).toEqual(jasmine.any(ArgSpec));
      expect(argSpec).not.toEqual(jasmine.any(ArgSpec.Unnamed));
      expect(argSpec.errorCode).toContain('emptyClaLabel');
      expect(argSpec.defaultValue).toBe(config.defaults.claLabel);
    });

    it('should have an appropriate validator for `claLabel`', () => {
      let validator = findSpecFor('claLabel').validator;

      [undefined, null, false, 0, '', true, 1, [], {}, () => {}].forEach(claLabel => {
        expect(validator(claLabel)).toBe(false);
      });

      [' ', 'foo'].forEach(claLabel => {
        expect(validator(claLabel)).toBe(true);
      });
    });

    // Helpers
    function findSpecFor(key) {
      return argSpecs.filter(argSpec => argSpec.key === key)[0];
    }
  });

  describe('#defaults', () => {
    let defaults;

    beforeEach(() => {
      defaults = config.defaults;
    });

    it('should be an object', () => {
      expect(defaults).toBeDefined();
      expect(defaults).toEqual(jasmine.any(Object));
    });

    it('should have a `claLabel` property (string)', () => {
      expect(defaults.claLabel).toBeDefined();
      expect(defaults.claLabel).toEqual(jasmine.any(String));
    });

    it('should have a `repo` property (string)', () => {
      expect(defaults.repo).toBeDefined();
      expect(defaults.repo).toEqual(jasmine.any(String));
    });

    it('should include the user in `repo`', () => {
      let tokens = defaults.repo.split('/');
      let userName = tokens[0];
      let repoName = tokens[1];

      expect(userName).toBeDefined();
      expect(repoName).toBeDefined();
      expect(tokens.length).toBe(2);
    });

    it('should not have a value for `prNo`', () => {
      expect(defaults.prNo).toBeNull();
    });
  });

  describe('#messages', () => {
    let messages;

    beforeEach(() => {
      messages = config.messages;
    });

    it('should be an object', () => {
      expect(messages).toBeDefined();
      expect(messages).toEqual(jasmine.any(Object));
    });

    describe('#errors', () => {
      let keyPrefix = 'ERROR_';
      let errors;

      beforeEach(() => {
        errors = messages.errors;
      });

      it('should be an object', () => {
        expect(errors).toBeDefined();
        expect(errors).toEqual(jasmine.any(Object));
      });

      it(`should have all its keys prefixed with \`${keyPrefix}\``, () => {
        Object.keys(errors).forEach(key => {
          expect(key.indexOf(keyPrefix)).toBe(0);
        });
      });

      ['emptyClaLabel', 'invalidRepo', 'missingPrNo'].forEach(errorId => {
        it(`should include an error message (string) for \`${errorId}\``, () => {
          let key = `${keyPrefix}${errorId}`;

          expect(errors[key]).toBeDefined();
          expect(errors[key]).toEqual(jasmine.any(String));
        });
      });
    });

    describe('#usage', () => {
      let usage;

      beforeEach(() => {
        usage = messages.usage;
      });

      it('should be a string', () => {
        expect(usage).toBeDefined();
        expect(usage).toEqual(jasmine.any(String));
      });

      it('should mention the default values', () => {
        expect(usage).toContain(config.defaults.repo);
        expect(usage).toContain(config.defaults.claLabel);
      });

      it('should mention the GitHub access-token variable name', () => {
        expect(usage).toContain(Checker.getGhTokenVar());
      });
    });
  });
});
