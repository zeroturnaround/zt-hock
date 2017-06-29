const http = require('http');
const request = require('request');
const hock = require('../');

const PORT = 5678;

describe('Hock HTTP Tests', function() {

    let hockInstance;
    let httpServer;

    describe("with available ports", function() {
        beforeEach(function(done) {
            hockInstance = hock.createHock();
            httpServer = http.createServer(hockInstance.handler).listen(PORT, function(err) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);

                done();
            });
        });

        it('should correctly respond to an HTTP GET request', function(done) {
            hockInstance
                .get('/url')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                done();
            });
        });

        it('should correctly respond to an HTTP POST request', function(done) {
            hockInstance
                .post('/post', { 'hock': 'post' })
                .reply(201, { 'hock': 'created' });

            request({
                uri: 'http://localhost:' + PORT + '/post',
                method: 'POST',
                json: {
                    'hock': 'post'
                }
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(201);
                expect(body).toEqual({ 'hock': 'created' });

                done();
            });
        });

        it('does not care about the order of the keys in the body', function(done) {
            hockInstance
                .post('/post', { keyOne: 'value1', keyTwo: 'value2' })
                .reply(201, { 'hock': 'created' });

            request({
                uri: 'http://localhost:' + PORT + '/post',
                method: 'POST',
                json: {
                    keyTwo: 'value2',
                    keyOne: 'value1'
                }
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(201);
                expect(body).toEqual({ 'hock': 'created' });

                done();
            });
        });

        it('should correctly respond to an HTTP PUT request', function(done) {
            hockInstance
                .put('/put', { 'hock': 'put' })
                .reply(204, { 'hock': 'updated' });

            request({
                uri: 'http://localhost:' + PORT + '/put',
                method: 'PUT',
                json: {
                    'hock': 'put'
                }
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(204);
                expect(body).toBe(undefined);

                done();
            });
        });

        it('should correctly respond to an HTTP PATCH request', function(done) {
            hockInstance
                .patch('/patch', { 'hock': 'patch' })
                .reply(204, { 'hock': 'updated' });

            request({
                uri: 'http://localhost:' + PORT + '/patch',
                method: 'PATCH',
                json: {
                    'hock': 'patch'
                }
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(204);
                expect(body).toBe(undefined);

                done();
            });
        });

        it('should correctly respond to an HTTP DELETE request', function(done) {
            hockInstance
                .delete('/delete')
                .reply(202, { 'hock': 'deleted' });

            request({
                uri: 'http://localhost:' + PORT + '/delete',
                method: 'DELETE'
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(202);
                expect(JSON.parse(body)).toEqual({ 'hock': 'deleted' });

                done();
            });
        });

        it('should correctly respond to an HTTP HEAD request', function(done) {
            hockInstance
                .head('/head')
                .reply(200, '', { 'content-type': 'plain/text' });

            request({
                uri: 'http://localhost:' + PORT + '/head',
                method: 'HEAD'
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(body).toEqual('');
                expect(res.headers).toEqual(expect.objectContaining({'content-type': 'plain/text'}));

                done();
            });
        });

        it('should correctly respond to an HTTP COPY request', function(done) {
            hockInstance
                .copy('/copysrc')
                .reply(204);

            request({
                uri: 'http://localhost:' + PORT + '/copysrc',
                method: 'COPY'
            }, function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(204);
                expect(body).toEqual('');

                done();
            });
        });

        it('unmatched requests should throw', function() {
            hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => hockInstance.done()).toThrow();
        });

        it('unmatched requests should NOT throw when configured', function() {
            const hockInstance = hock.createHock({throwOnUnprocessedRequests: false});

            hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => hockInstance.done()).not.toThrow();
        });

        it('unmatched requests should call done callback with err', function(done) {
            hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' })
                .done(function(err) {
                    expect(err).not.toBe(undefined);

                    done();
                });
        });

        it('should work with a delay configured', function(done) {
            hockInstance
                .get('/url')
                .delay(1000)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                done();
            });
        });

        afterEach(function(done) {
            httpServer.close(done);
        });
    });

    describe("dynamic path replacing / filtering", function() {
        beforeEach(function(done) {
            hockInstance = hock.createHock();
            httpServer = http.createServer(hockInstance.handler).listen(PORT, function(err) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);

                done();
            });
        });

        it('should correctly use regex', function(done) {
            hockInstance
                .filteringPathRegEx(/password=[^&]*/g, 'password=XXX')
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url?password=artischocko', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                done();

            });
        });

        it('should correctly use functions', function(done) {
            hockInstance
                .filteringPath(function(p) {
                    expect(p).toEqual('/url?password=artischocko');
                    return '/url?password=XXX';
                })
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url?password=artischocko', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(res).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                done();
            });
        });

        afterEach(function(done) {
            httpServer.close(done);
        });
    });

    describe("test if route exists", function() {
        beforeEach(function(done) {
            hockInstance = hock.createHock();
            httpServer = http.createServer(hockInstance.handler).listen(PORT, function(err) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);

                done();
            });
        });

        it('should allow testing for url', function(done) {
            hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/arti')
                .reply(200, { 'hock': 'ok' });

            expect(hockInstance.hasRoute('GET', '/url?password=foo')).toEqual(true);
            expect(hockInstance.hasRoute('GET', '/arti')).toEqual(true);
            expect(hockInstance.hasRoute('GET', '/notexist')).toEqual(false);

            done();
        });

        it('matches the header', function(done) {
            hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/artischocko', { 'foo-type': 'artischocke' })
                .reply(200, { 'hock': 'ok' });

            expect(
                hockInstance.hasRoute('GET', '/bla?password=foo', null, { 'content-type': 'plain/text' })
            ).toEqual(false);
            expect(
                hockInstance.hasRoute('GET', '/artischocko', null, { 'foo-type': 'artischocke' })
            ).toEqual(true);

            done();
        });

        it('matches the body', function(done) {
            hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .post('/artischocko', 'enteente')
                .reply(200, { 'hock': 'ok' });

            expect(
                hockInstance.hasRoute('GET', '/bla?password=foo', 'testing')
            ).toEqual(false);
            expect(
                hockInstance.hasRoute('POST', '/artischocko', 'enteente')
            ).toEqual(true);

            done();
        });

        afterEach(function(done) {
            httpServer.close(done);
        });
    });
});
