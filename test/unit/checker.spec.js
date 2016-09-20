'use strict';

// Imports
let https = require('https');
let stream = require('stream');

// Imports - Local
let Checker = require('../../lib/checker');

// Tests
describe('Checker', () => {
  let ghTokenVar = Checker.getGhTokenVar();
  let hadGhToken;

  beforeEach(() => {
    if (!(hadGhToken = process.env.hasOwnProperty(ghTokenVar))) {
      process.env[ghTokenVar] = 'foo';
    }
  });

  afterEach(() => {
    if (!hadGhToken) {
      delete process.env[ghTokenVar];
    }
  });

  describe('Checker#getGhTokenVar()', () => {
    it('should return the GitHub access-token var (string)', () => {
      expect(Checker.getGhTokenVar()).toBe('GITHUB_ACCESS_TOKEN');
    });
  });

  describe('#constructor()', () => {
    it('should accept an `options` argument', () => {
      let checker = new Checker({
        ghToken: 'foo',
        claLabel: 'bar',
        repo: 'baz'
      });

      expect(checker._options.ghToken).toBe('foo');
      expect(checker._options.claLabel).toBe('bar');
      expect(checker._options.repo).toBe('baz');
    });

    it('should fallback to default values if no `options` is specified', () => {
      let checker = new Checker();

      expect(checker._options.ghToken).toEqual(jasmine.any(String));
      expect(checker._options.claLabel).toEqual(jasmine.any(String));
      expect(checker._options.repo).toEqual(jasmine.any(String));
    });

    it('should support passing a "partial" options object', () => {
      let checker1 = new Checker({ghToken: 'foo'});
      let checker2 = new Checker({claLabel: 'bar'});
      let checker3 = new Checker({repo: 'baz'});

      expect(checker1._options.ghToken).toBe('foo');
      expect(checker1._options.claLabel).toEqual(jasmine.any(String));
      expect(checker1._options.repo).toEqual(jasmine.any(String));

      expect(checker2._options.ghToken).toEqual(jasmine.any(String));
      expect(checker2._options.claLabel).toBe('bar');
      expect(checker2._options.repo).toEqual(jasmine.any(String));

      expect(checker3._options.ghToken).toEqual(jasmine.any(String));
      expect(checker3._options.claLabel).toEqual(jasmine.any(String));
      expect(checker3._options.repo).toBe('baz');
    });

    it('should support disabling the use of GitHub access-token (even if one exists)', () => {
      let checker1 = new Checker({ghToken: ''});
      let checker2 = new Checker({ghToken: false});

      expect(checker1._options.ghToken).toBe(process.env[ghTokenVar]);
      expect(checker2._options.ghToken).not.toBe(process.env[ghTokenVar]);
      expect(checker2._options.ghToken).toBe(false);
    });

    it('should accept a `quiet` argument', () => {
      let checker1 = new Checker();
      let checker2 = new Checker(null, 0);
      let checker3 = new Checker(null, false);
      let checker4 = new Checker(null, true);

      expect(checker1._quiet).toBe(false);
      expect(checker2._quiet).toBe(false);
      expect(checker3._quiet).toBe(false);
      expect(checker4._quiet).toBe(true);
    });
  });

  describe('#check()', () => {
    let PassThrough = stream.PassThrough;
    let httpsGetSpy;
    let checker;

    beforeEach(() => {
      httpsGetSpy = spyOn(https, 'get').and.callFake(() => new PassThrough());

      checker = new Checker({
        ghToken: 'foo',
        claLabel: 'bar',
        repo: 'baz'
      });
    });

    it('should return a promise', () => {
      let promise = checker.check(12345);

      expect(promise).toEqual(jasmine.any(Promise));
    });

    it('should reject the returned promise on request error', done => {
      let request = new PassThrough();
      httpsGetSpy.and.callFake(() => request);

      checker.check(12345).catch(err => {
        expect(err).toBe('Test');
        done();
      });

      request.emit('error', 'Test');
    });

    it('should reject the returned promise on response error', done => {
      httpsGetSpy.and.callFake((_, cb) => {
        let request = new PassThrough();
        let response = new PassThrough();

        cb(response);
        response.emit('error', 'Test');

        return request;
      });

      checker.check(12345).catch(err => {
        expect(err).toBe('Test');
        done();
      });
    });

    it('should request the specified PR\'s data', () => {
      checker.check(12345);

      expect(httpsGetSpy).toHaveBeenCalledTimes(1);
      expect(httpsGetSpy.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({
        path: '/repos/baz/issues/12345',
        headers: jasmine.objectContaining({
          Authorization: 'token foo'
        })
      }));
    });

    it('should not set the `Authorization` header if `ghToken` is false', () => {
      spyOn(console, 'warn');

      let checker1 = checker;
      let checker2 = new Checker({ghToken: false});

      checker1.check(12345);
      checker2.check(12345);

      expect(httpsGetSpy).toHaveBeenCalledTimes(2);

      let headers1 = httpsGetSpy.calls.argsFor(0)[0].headers;
      let headers2 = httpsGetSpy.calls.argsFor(1)[0].headers;

      expect(headers1.Authorization).toBe('token foo');
      expect(headers2.Authorization).toBeUndefined();
    });

    it('should resolve the returned promise if the `claLabel` is present', (done) => {
      httpsGetSpy.and.callFake((_, cb) => {
        let request = new PassThrough();
        let response = new PassThrough();

        cb(response);
        response.end(JSON.stringify({labels: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}]}));

        return request;
      });
      checker.check(12345).then(done);
    });

    it('should reject the returned promise if the `claLabel` is not present', (done) => {
      httpsGetSpy.and.callFake((_, cb) => {
        let request = new PassThrough();
        let response = new PassThrough();

        cb(response);
        response.end(JSON.stringify({labels: [{name: 'foo'}, {name: 'baz'}]}));

        return request;
      });
      checker.check(12345).catch(done);
    });

    it('should warn about a missing GitHub access-token, unless in `quiet` mode', () => {
      spyOn(console, 'warn');

      let checker1 = new Checker({ghToken: false}, false);
      let checker2 = new Checker({ghToken: false}, true);

      expect(console.warn).not.toHaveBeenCalled();

      checker1.check(12345);
      expect(console.warn).toHaveBeenCalledTimes(1);

      checker2.check(12345);
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });
});
