'use strict';

// Imports - Local
let config = require('../../lib/config');

// Tests
describe('config', () => {
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
  });

  describe('#ghTokenVar', () => {
    it('should be a string', () => {
      expect(config.ghTokenVar).toBeDefined();
      expect(config.ghTokenVar).toEqual(jasmine.any(String));
    });
  });

  describe('#usageMessage', () => {
    let message;

    beforeEach(() => {
      message = config.usageMessage;
    });

    it('should be a string', () => {
      expect(message).toBeDefined();
      expect(message).toEqual(jasmine.any(String));
    });

    it('should mention the default values', () => {
      expect(message.indexOf(config.defaults.claLabel)).toBeGreaterThan(-1);
      expect(message.indexOf(config.defaults.repo)).toBeGreaterThan(-1);
    });

    it('should mention the GitHub access-token variable name', () => {
      expect(message.indexOf(config.ghTokenVar)).toBeGreaterThan(-1);
    });
  });
});
