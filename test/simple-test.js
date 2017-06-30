const request = require('request');
const hock = require('../');
const {
    createHttpServer,
    catchErrors,
    createPort
} = require("./util.js");

describe('Hock HTTP Tests', function() {
    describe("with available ports", function() {
        beforeEach(function(done) {
            this.port = createPort();
            this.hockInstance = hock.createHock();
            this.httpServer = createHttpServer(this.hockInstance, this.port, done);
        });

        afterEach(function(done) {
            this.httpServer.close(done);
        });

        it('should correctly respond to an HTTP GET request', function(done) {
            this.hockInstance
                .get('/url')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });
                    done();
                });
            });
        });

        it('should correctly respond to an HTTP POST request', function(done) {
            this.hockInstance
                .post('/post', { 'hock': 'post' })
                .reply(201, { 'hock': 'created' });

            request({
                uri: 'http://localhost:' + this.port + '/post',
                method: 'POST',
                json: {
                    'hock': 'post'
                }
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(201);
                    expect(body).toEqual({ 'hock': 'created' });

                    done();
                });
            });
        });

        it('does not care about the order of the keys in the body', function(done) {
            this.hockInstance
                .post('/post', { keyOne: 'value1', keyTwo: 'value2' })
                .reply(201, { 'hock': 'created' });

            request({
                uri: 'http://localhost:' + this.port + '/post',
                method: 'POST',
                json: {
                    keyTwo: 'value2',
                    keyOne: 'value1'
                }
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(201);
                    expect(body).toEqual({ 'hock': 'created' });

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP PUT request', function(done) {
            this.hockInstance
                .put('/put', { 'hock': 'put' })
                .reply(204, { 'hock': 'updated' });

            request({
                uri: 'http://localhost:' + this.port + '/put',
                method: 'PUT',
                json: {
                    'hock': 'put'
                }
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toBe(undefined);

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP PATCH request', function(done) {
            this.hockInstance
                .patch('/patch', { 'hock': 'patch' })
                .reply(204, { 'hock': 'updated' });

            request({
                uri: 'http://localhost:' + this.port + '/patch',
                method: 'PATCH',
                json: {
                    'hock': 'patch'
                }
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toBe(undefined);

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP DELETE request', function(done) {
            this.hockInstance
                .delete('/delete')
                .reply(202, { 'hock': 'deleted' });

            request({
                uri: 'http://localhost:' + this.port + '/delete',
                method: 'DELETE'
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(202);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'deleted' });

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP HEAD request', function(done) {
            this.hockInstance
                .head('/head')
                .reply(200, '', { 'content-type': 'plain/text' });

            request({
                uri: 'http://localhost:' + this.port + '/head',
                method: 'HEAD'
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual('');
                    expect(res.headers).toEqual(expect.objectContaining({'content-type': 'plain/text'}));

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP COPY request', function(done) {
            this.hockInstance
                .copy('/copysrc')
                .reply(204);

            request({
                uri: 'http://localhost:' + this.port + '/copysrc',
                method: 'COPY'
            }, (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toEqual('');

                    done();
                });
            });
        });

        it('unmatched requests should throw', function() {
            this.hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => this.hockInstance.done()).toThrow();
        });

        it('unmatched requests should NOT throw when configured', function(done) {
            const hockInstance = hock.createHock({throwOnUnprocessedRequests: false});

            hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => hockInstance.done(() => done())).not.toThrow();
        });

        it('unmatched requests should call done callback with err', function(done) {
            this.hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' })
                .done((err) => {
                    expect(err).not.toBe(undefined);
                    done();
                });
        });

        it('should work with a delay configured', function(done) {
            this.hockInstance
                .get('/url')
                .delay(1000)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });
    });

    describe("dynamic path replacing / filtering", function() {
        beforeEach(function(done) {
            this.port = createPort();
            this.hockInstance = hock.createHock();
            this.httpServer = createHttpServer(this.hockInstance, this.port, done);
        });

        afterEach(function(done) {
            this.httpServer.close(done);
        });

        it('should correctly use regex', function(done) {
            this.hockInstance
                .filteringPathRegEx(/password=[^&]*/g, 'password=XXX')
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url?password=artischocko', (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });

        it('should correctly use functions', function(done) {
            this.hockInstance
                .filteringPath(function(p) {
                    expect(p).toEqual('/url?password=artischocko');
                    return '/url?password=XXX';
                })
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url?password=artischocko', (err, res, body) => {
                catchErrors(done, () => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });
    });

    describe("test if route exists", function() {
        beforeEach(function(done) {
            this.port = createPort();
            this.hockInstance = hock.createHock();
            this.httpServer = createHttpServer(this.hockInstance, this.port, done);
        });

        afterEach(function(done) {
            this.httpServer.close(done);
        });

        it('should allow testing for url', function(done) {
            this.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/arti')
                .reply(200, { 'hock': 'ok' });

            expect(this.hockInstance.hasRoute('GET', '/url?password=foo')).toEqual(true);
            expect(this.hockInstance.hasRoute('GET', '/arti')).toEqual(true);
            expect(this.hockInstance.hasRoute('GET', '/notexist')).toEqual(false);

            done();
        });

        it('matches the header', function(done) {
            this.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/artischocko', { 'foo-type': 'artischocke' })
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                expect(
                    this.hockInstance.hasRoute('GET', '/bla?password=foo', null, { 'content-type': 'plain/text' })
                ).toEqual(false);

                expect(
                    this.hockInstance.hasRoute('GET', '/artischocko', null, { 'foo-type': 'artischocke' })
                ).toEqual(true);

                done();
            });
        });

        it('matches the body', function(done) {
            this.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .post('/artischocko', 'enteente')
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                expect(
                    this.hockInstance.hasRoute('GET', '/bla?password=foo', 'testing')
                ).toEqual(false);
                expect(
                    this.hockInstance.hasRoute('POST', '/artischocko', 'enteente')
                ).toEqual(true);

                done();
            });
        });
    });
});
