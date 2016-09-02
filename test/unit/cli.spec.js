'use strict';

// Imports - Local
let Checker = require('../../lib/checker');
let Cli = require('../../lib/cli');
let config = require('../../lib/config');

// Tests
describe('Cli', () => {
  let cli;

  beforeEach(() => {
    cli = new Cli();
  });

  describe('#_displayUsage()', () => {
    it('should display the usage instructions', () => {
      spyOn(console, 'log');

      cli._displayUsage();

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log.calls.argsFor(0)[0]).toContain(config.usageMessage);
    });
  });

  describe('#_getAndValidateInput()', () => {
    beforeEach(() => {
      spyOn(cli, '_onError');
    });

    it('should stop parsing if `--usage` is detected', () => {
      let args = ['foo', 'bar', '--baz=qux', '--usage'];
      let input = cli._getAndValidateInput(args);

      expect(input).toEqual({usage: true});
    });

    it('should remove surrounding quotes from "named" arguments', () => {
      spyOn(cli, '_removeSurroundingQuotes').and.callThrough();

      let args = ['"12345"', '--claLabel=\'foo: bar\'', '--repo="baz/qux"'];
      let input = cli._getAndValidateInput(args);

      expect(cli._removeSurroundingQuotes).toHaveBeenCalled();
      expect(input).toEqual(jasmine.objectContaining({
        claLabel: 'foo: bar',
        repo: 'baz/qux',
        prNo: '"12345"'
      }));
    });

    it('should read the `claLabel` argument', () => {
      let args;
      let input;

      args = ['12345', '--claLabel="foo: bar"'];
      input = cli._getAndValidateInput(args);

      expect(input.claLabel).toBe('foo: bar');

      args = ['12345'];
      input = cli._getAndValidateInput(args);

      expect(input.claLabel).toBe(null);
    });

    it('should read the `repo` argument', () => {
      let args;
      let input;

      args = ['12345', '--repo=foo/bar'];
      input = cli._getAndValidateInput(args);

      expect(input.repo).toBe('foo/bar');

      args = ['12345'];
      input = cli._getAndValidateInput(args);

      expect(input.repo).toBe(null);
    });

    it('should read the `prNo` (first "unnamed" argument)', () => {
      let args;
      let input;

      args = ['12345'];
      input = cli._getAndValidateInput(args);

      expect(input.prNo).toBe(12345);

      args = ['12345', '--foo=bar'];
      input = cli._getAndValidateInput(args);

      expect(input.prNo).toBe(12345);

      args = ['--foo=bar', '12345'];
      input = cli._getAndValidateInput(args);

      expect(input.prNo).toBe(12345);

      args = ['--foo=bar', '--baz=qux', '12345'];
      input = cli._getAndValidateInput(args);

      expect(input.prNo).toBe(12345);

      args = ['12345', '67890'];
      input = cli._getAndValidateInput(args);

      expect(input.prNo).toBe(12345);
    });

    it('should error if a custom `repo` does not contain a username', () => {
      cli._getAndValidateInput(['12345']);
      expect(cli._onError).not.toHaveBeenCalled();

      cli._getAndValidateInput(['12345', '--repo=foo/bar']);
      expect(cli._onError).not.toHaveBeenCalled();

      cli._getAndValidateInput(['12345', '--repo=foo-bar']);
      expect(cli._onError).toHaveBeenCalled();
    });

    it('should error if no PR is specified', () => {
      cli._getAndValidateInput(['12345', '--repo=foo/bar']);
      expect(cli._onError).not.toHaveBeenCalled();

      cli._getAndValidateInput(['--repo=foo/bar']);
      expect(cli._onError).toHaveBeenCalled();
    });
  });

  describe('#_onError()', () => {
    beforeEach(() => {
      spyOn(console, 'error');
      spyOn(cli, '_reportAndExit');
    });

    it('should call `_reportAndExit()` with `1`', () => {
      cli._onError();

      expect(cli._reportAndExit).toHaveBeenCalledWith(1);
    });

    it('should log an error to the console (if specified)', () => {
      cli._onError('Test');

      expect(console.error).toHaveBeenCalled();
      expect(console.error.calls.argsFor(0)[0]).toContain('Test');
      expect(cli._reportAndExit).toHaveBeenCalledWith(1);

      console.error.calls.reset();
      cli._reportAndExit.calls.reset();

      cli._onError();

      expect(console.error).not.toHaveBeenCalled();
      expect(cli._reportAndExit).toHaveBeenCalledWith(1);
    });
  });

  describe('#_onSuccess()', () => {
    beforeEach(() => {
      spyOn(cli, '_reportAndExit');
    });

    it('should call `_reportAndExit()` with `0`', () => {
      cli._onSuccess();

      expect(cli._reportAndExit).toHaveBeenCalledWith(0);
    });
  });

  describe('#_removeSurroundingQuotes()', () => {
    it('should return the passed in Object', () => {
      let input = {foo: '"bar"', baz: '"qux"'};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toBe(input);
    });

    it('should remove surrounding double-quotes', () => {
      let input = {foo: '"bar"', baz: '"qux"'};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toEqual({foo: 'bar', baz: 'qux'});
    });

    it('should remove surrounding single-quotes', () => {
      let input = {foo: '\'bar\'', baz: '\'qux\''};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toEqual({foo: 'bar', baz: 'qux'});
    });

    it('should not remove non-matching quotes', () => {
      let input = {foo: '"bar\'', baz: '\'qux"'};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toEqual({foo: '"bar\'', baz: '\'qux"'});
    });

    it('should process top-level properties only', () => {
      let input = {foo: {bar: '"bar"'}, baz: ['"qux"']};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toEqual({foo: {bar: '"bar"'}, baz: ['"qux"']});
    });

    it('should remove the outer-most pair of quotes only', () => {
      let input = {foo: '"\'bar\'"', baz: '\'"qux"\''};
      let output = cli._removeSurroundingQuotes(input);

      expect(output).toEqual({foo: '\'bar\'', baz: '"qux"'});
    });
  });

  describe('#_reportAndExit()', () => {
    beforeEach(() => {
      spyOn(console, 'log');
      spyOn(process, 'exit');
    });

    it('should exit with the specified code', () => {
      cli._reportAndExit(0);
      cli._reportAndExit(1);
      cli._reportAndExit(2);

      expect(process.exit).toHaveBeenCalledTimes(3);
      expect(process.exit.calls.argsFor(0)[0]).toBe(0);
      expect(process.exit.calls.argsFor(1)[0]).toBe(1);
      expect(process.exit.calls.argsFor(2)[0]).toBe(2);
    });

    it('should default to exiting with `0`', () => {
      cli._reportAndExit();

      expect(process.exit).toHaveBeenCalledTimes(1);
      expect(process.exit.calls.argsFor(0)[0]).toBe(0);
    });

    it('should log an appropriate message to the console', () => {
      cli._reportAndExit(0);
      cli._reportAndExit(1);

      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log.calls.argsFor(0)[0]).toMatch(/^:\)/);
      expect(console.log.calls.argsFor(1)[0]).toMatch(/^:\(/);
    });
  });

  describe('#run()', () => {
    let checkSpy;

    beforeEach(() => {
      spyOn(process, 'exit');

      checkSpy = spyOn(Checker.prototype, 'check');
      checkSpy.and.returnValue(new Promise(() => {}));
    });

    it('should read and validate the input', () => {
      spyOn(cli, '_getAndValidateInput').and.returnValue({});

      let args = [];
      cli.run(args);

      expect(cli._getAndValidateInput).toHaveBeenCalledWith(args);
    });

    it('should create a Checker and call `check()`', () => {
      let called = false;

      checkSpy.and.callFake(function () {
        expect(this._options.ghToken).toBeDefined();
        expect(this._options).toEqual(jasmine.objectContaining({
          claLabel: 'foo: bar',
          repo: 'baz/qux'
        }));

        called = true;

        return new Promise(() => {});
      });

      let args = ['12345', '--claLabel="foo: bar"', '--repo=baz/qux'];
      cli.run(args);

      expect(called).toBe(true);
    });

    it('should pass `prNo` to `check()`', () => {
      let args = ['12345'];
      cli.run(args);

      expect(checkSpy).toHaveBeenCalledWith(12345);
    });

    it('should return a promise', () => {
      let args = ['12345'];
      let promise = cli.run(args);

      expect(promise).toEqual(jasmine.any(Promise));
    });

    it('should attach a success callback to the promise returned by Checker', done => {
      checkSpy.and.returnValue(Promise.resolve());
      spyOn(cli, '_onSuccess');

      let args = ['12345'];
      cli.run(args).then(() => {
        expect(cli._onSuccess).toHaveBeenCalled();
        done();
      });
    });

    it('should attach an error callback to the promise returned by Checker', done => {
      checkSpy.and.returnValue(Promise.reject('Test'));
      spyOn(cli, '_onError');

      let args = ['12345'];
      cli.run(args).then(() => {
        expect(cli._onError).toHaveBeenCalledWith('Test');
        done();
      });
    });

    it('should display the usage instructions (and exit) if `--usage` is detected', () => {
      spyOn(cli, '_displayUsage').and.callFake(() => {
        expect(process.exit).not.toHaveBeenCalled();
      });
      checkSpy.and.callFake(() => {
        // `process.exit` is being stubbed (so the process isn't really terminated),
        // but it should have been called before calling `Checker.prototype.check()`.
        expect(process.exit).toHaveBeenCalledWith(0);

        return new Promise(() => {});
      });

      let args = ['--usage'];
      cli.run(args);

      expect(cli._displayUsage).toHaveBeenCalled();
      expect(checkSpy).toHaveBeenCalled();
    });
  });
});
