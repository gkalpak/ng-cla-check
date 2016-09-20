'use strict';

// Imports
let ngMaintainUtils = require('@gkalpak/ng-maintain-utils');

let AbstractCli = ngMaintainUtils.AbstractCli;

// Imports - Local
let Checker = require('../../lib/checker');
let Cli = require('../../lib/cli');
let Config = require('../../lib/config');

// Tests
describe('Cli', () => {
  let cli;

  beforeEach(() => {
    cli = new Cli();

    spyOn(console, 'log');
  });

  describe('#constructor()', () => {
    it('should create a `Config` instance (and pass it to its super-constructor)', () => {
      expect(cli._config).toEqual(jasmine.any(Config));
    });
  });

  [
    '_displayExperimentalTool',
    '_displayHeader',
    '_displayInstructions'
  ].forEach(methodName => {
    describe(`#${methodName}()`, () => {
      it('should do nothing', () => {
        cli[methodName]();

        expect(console.log).not.toHaveBeenCalled();
      });
    });
  });

  describe('#_theEnd()', () => {
    it('should log a happy message to the console', () => {
      cli._theEnd();
      cli._theEnd(false);
      cli._theEnd(true);

      expect(console.log).toHaveBeenCalledTimes(3);
      expect(console.log.calls.argsFor(0)[0]).toContain(':)');
      expect(console.log.calls.argsFor(1)[0]).toContain(':)');
      expect(console.log.calls.argsFor(2)[0]).toContain(':)');
    });

    it('should return the input value', () => {
      let input = {};
      let output = cli._theEnd(input);

      expect(output).toBe(input);
    });
  });

  describe('#getPhases()', () => {
    it('should return an empty array', () => {
      let phases = cli.getPhases();

      expect(phases).toEqual([]);
    });
  });

  describe('#run()', () => {
    let superDeferred;

    beforeEach(() => {
      superDeferred = null;

      spyOn(AbstractCli.prototype, 'run').and.callFake(() => new Promise((resolve, reject) => {
        superDeferred = {resolve, reject};
      }));
    });

    it('should call its super-method with the specified `rawArgs` and a callback', () => {
      cli.run(['foo', 'bar']);

      expect(AbstractCli.prototype.run).toHaveBeenCalledWith(['foo', 'bar'], jasmine.any(Function));
    });

    it('should return a promise', () => {
      let promise = cli.run([]);

      expect(promise).toEqual(jasmine.any(Promise));
    });

    it('should resolve the returned promise if the super-method resolves', done => {
      cli.
        run([]).
        then(value => expect(value).toBe('foo')).
        then(done);

      superDeferred.resolve('foo');
    });

    describe('- On error', () => {
      let errorCb;

      beforeEach(() => {
        errorCb = jasmine.createSpy('errorCb').and.returnValue(Promise.reject());

        spyOn(cli._uiUtils, 'reportAndRejectFnGen').and.returnValue(errorCb);
      });

      it('should log a sad message to the console if `check()` fails', done => {
        spyOn(Checker.prototype, 'check').and.returnValue(Promise.reject());
        AbstractCli.prototype.run.and.callFake((_, doWork) => doWork({}));

        cli.
          run([]).
          catch(() => {
            expect(cli._checker.check).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalled();
            expect(console.log.calls.argsFor(0)[0]).toContain(':(');

            done();
          });
      });

      it('should not log anything if its super-method rejects (but not `check()`)', done => {
        cli.
          run([]).
          catch(() => {
            expect(console.log).not.toHaveBeenCalled();
            done();
          });

        superDeferred.reject('for a reason');
      });

      it('should reject the returned promise if the super-method rejects', done => {
        cli.
          run([]).
          catch(done);

        superDeferred.reject();
      });

      it('should not "reportAndReject" if the rejection is empty', done => {
        cli.
          run([]).
          catch(() => {
            expect(errorCb).not.toHaveBeenCalled();
            done();
          });

        superDeferred.reject();
      });

      it('should "reportAndReject" if the rejection is non-empty', done => {
        cli.
          run([]).
          catch(() => {
            expect(cli._uiUtils.reportAndRejectFnGen).toHaveBeenCalledWith('ERROR_unexpected');
            expect(errorCb).toHaveBeenCalledWith('for a reason');

            done();
          });

        superDeferred.reject('for a reason');
      });

      it('should reject with the value returned by "reportAndReject"', done => {
        errorCb.and.returnValue(Promise.reject('for no reason'));

        cli.
          run([]).
          catch(error => {
            expect(error).toBe('for no reason');
            done();
          });

        superDeferred.reject('for a reason');
      });
    });

    describe('- Doing work', () => {
      let input;
      let checkSpy;

      beforeEach(() => {
        input = {};
        checkSpy = spyOn(Checker.prototype, 'check').and.returnValue(Promise.resolve('foo'));

        AbstractCli.prototype.run.and.callFake((_, doWork) => doWork(input));
      });

      it('should create a `Checker`', done => {
        cli.
          run([]).
          then(() => expect(cli._checker).toEqual(jasmine.any(Checker))).
          then(done);
      });

      it('should pass `claLabel` and `repo` to `Checker`', done => {
        input.claLabel = 'foo';
        input.repo = 'bar';

        cli.
          run([]).
          then(() => expect(cli._checker._options.claLabel).toBe('foo')).
          then(() => expect(cli._checker._options.repo).toBe('bar')).
          then(done);
      });

      it('should call `check()` with `prNo` and return the returned value', done => {
        input.prNo = 12345;

        cli.
          run([]).
          then(value => expect(value).toBe('foo')).
          then(() => expect(checkSpy).toHaveBeenCalledWith(12345)).
          then(done);
      });
    });
  });
});
