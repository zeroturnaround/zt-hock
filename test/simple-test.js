const request = require('request');
const hock = require('../');
const {
    createHttpServer,
    catchErrors,
    createPort
} = require("./util.js");

describe('Hock HTTP Tests', () => {
    let testContext;

    beforeEach(() => {
        testContext = {};
    });

    describe("with available ports", () => {
        beforeEach(done => {
            testContext.port = createPort();
            testContext.hockInstance = hock.createHock();
            testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
        });

        afterEach(done => {
            testContext.httpServer.close(done);
        });

        it('should correctly respond to an HTTP GET request', done => {
            testContext.hockInstance
                .get('/url')
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });
                    done();
                });
            });
        });

        it('should correctly respond to an HTTP POST request', done => {
            testContext.hockInstance
                .post('/post', { 'hock': 'post' })
                .reply(201, { 'hock': 'created' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/post',
                    method: 'POST',
                    json: {
                        'hock': 'post'
                    }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(201);
                    expect(body).toEqual({ 'hock': 'created' });

                    done();
                });
            });
        });

        it('does not care about the order of the keys in the body', done => {
            testContext.hockInstance
                .post('/post', { keyOne: 'value1', keyTwo: 'value2' })
                .reply(201, { 'hock': 'created' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/post',
                    method: 'POST',
                    json: {
                        keyTwo: 'value2',
                        keyOne: 'value1'
                    }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(201);
                    expect(body).toEqual({ 'hock': 'created' });

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP PUT request', done => {
            testContext.hockInstance
                .put('/put', { 'hock': 'put' })
                .reply(204, { 'hock': 'updated' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/put',
                    method: 'PUT',
                    json: {
                        'hock': 'put'
                    }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toBe(undefined);

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP PATCH request', done => {
            testContext.hockInstance
                .patch('/patch', { 'hock': 'patch' })
                .reply(204, { 'hock': 'updated' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/patch',
                    method: 'PATCH',
                    json: {
                        'hock': 'patch'
                    }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toBe(undefined);

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP DELETE request', done => {
            testContext.hockInstance
                .delete('/delete')
                .reply(202, { 'hock': 'deleted' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/delete',
                    method: 'DELETE'
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(202);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'deleted' });

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP HEAD request', done => {
            testContext.hockInstance
                .head('/head')
                .reply(200, '', { 'content-type': 'plain/text' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/head',
                    method: 'HEAD'
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual('');
                    expect(res.headers).toEqual(expect.objectContaining({'content-type': 'plain/text'}));

                    done();
                });
            });
        });

        it('should correctly respond to an HTTP COPY request', done => {
            testContext.hockInstance
                .copy('/copysrc')
                .reply(204);

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/copysrc',
                    method: 'COPY'
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(204);
                    expect(body).toEqual('');

                    done();
                });
            });
        });

        it('unmatched requests should throw', done => {
            testContext.hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => testContext.hockInstance.done()).toThrow();
            done();
        });

        it('unmatched requests should NOT throw when configured', done => {
            const hockInstance = hock.createHock({throwOnUnprocessedRequests: false});

            hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(() => hockInstance.done(() => done())).not.toThrow();
        });

        it('unmatched requests should call done callback with err', done => {
            testContext.hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' })
                .done((err) => {
                    expect(err).not.toBe(undefined);
                    done();
                });
        });

        it('unmatched requests should show up with getUnusedAssertions()', () => {
            testContext.hockInstance
                .head('/head')
                .reply(200, '', { 'Content-Type': 'plain/text' });

            expect(testContext.hockInstance.getUnusedAssertions().length).toBe(1);
        });

        it('should work with a delay configured', done => {
            testContext.hockInstance
                .get('/url')
                .delay(1000)
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });
    });

    describe("dynamic path replacing / filtering", () => {
        beforeEach(done => {
            testContext.port = createPort();
            testContext.hockInstance = hock.createHock();
            testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
        });

        afterEach(done => {
            testContext.httpServer.close(done);
        });

        it('should correctly use regex', done => {
            testContext.hockInstance
                .filteringPathRegEx(/password=[^&]*/g, 'password=XXX')
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url?password=artischocko', (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });

        it('should correctly use functions', done => {
            testContext.hockInstance
                .filteringPath(function(p) {
                    expect(p).toEqual('/url?password=artischocko');
                    return '/url?password=XXX';
                })
                .get('/url?password=XXX')
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url?password=artischocko', (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });
    });

    describe("dynamic request body replacing / filtering", () => {
        beforeEach(done => {
            testContext.port = createPort();
            testContext.hockInstance = hock.createHock();
            testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
        });

        afterEach(done => {
            testContext.httpServer.close(done);
        });

        it('should correctly use regex', done => {
            testContext.hockInstance
                .filteringRequestBodyRegEx(/\d{3}/, 'numbers-stripped')
                .post('/post', { numbers: 'numbers-stripped' })
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/post',
                    method: 'POST',
                    json: { numbers: '123' }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });

        it('should correctly use functions', done => {
            testContext.hockInstance
                .filteringRequestBody(function({body, url}) {
                    expect(body).toEqual(JSON.stringify({numbers: '123'}));
                    expect(url).toEqual("/post");
                    return JSON.stringify({numbers: 'numbers-stripped'});
                })
                .post('/post', { numbers: 'numbers-stripped' })
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request({
                    uri: 'http://localhost:' + testContext.port + '/post',
                    method: 'POST',
                    json: { numbers: '123' }
                }, (err, res, body) => {
                    expect(err).toBeFalsy();
                    expect(res).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual({ 'hock': 'ok' });

                    done();
                });
            });
        });
    });

    describe("test if route exists", () => {
        beforeEach(done => {
            testContext.port = createPort();
            testContext.hockInstance = hock.createHock();
            testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
        });

        afterEach(done => {
            testContext.httpServer.close(done);
        });

        it('should allow testing for url', done => {
            testContext.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/arti')
                .reply(200, { 'hock': 'ok' });

            expect(testContext.hockInstance.hasRoute('GET', '/url?password=foo')).toEqual(true);
            expect(testContext.hockInstance.hasRoute('GET', '/arti')).toEqual(true);
            expect(testContext.hockInstance.hasRoute('GET', '/notexist')).toEqual(false);

            done();
        });

        it('matches the header', done => {
            testContext.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .get('/artischocko', { 'foo-type': 'artischocke' })
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                expect(
                    testContext.hockInstance.hasRoute('GET', '/bla?password=foo', null, { 'content-type': 'plain/text' })
                ).toEqual(false);

                expect(
                    testContext.hockInstance.hasRoute('GET', '/artischocko', null, { 'foo-type': 'artischocke' })
                ).toEqual(true);

                done();
            });
        });

        it('matches the body', done => {
            testContext.hockInstance
                .get('/url?password=foo')
                .reply(200, { 'hock': 'ok' })
                .post('/artischocko', 'enteente')
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                expect(
                    testContext.hockInstance.hasRoute('GET', '/bla?password=foo', 'testing')
                ).toEqual(false);
                expect(
                    testContext.hockInstance.hasRoute('POST', '/artischocko', 'enteente')
                ).toEqual(true);

                done();
            });
        });
    });

    describe("when throwOnUnmatched is set to false", () => {
        beforeEach(done => {
            testContext.port = createPort();
            testContext.hockInstance = hock.createHock({throwOnUnmatched: false});
            testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
        });

        afterEach(done => {
            testContext.httpServer.close(done);
        });

        it('should correctly respond to a missing request', done => {
            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/notUrl',
                    (err, res, body) => {
                        expect(err).toBeFalsy();
                        expect(res).not.toBe(undefined);
                        expect(res.headers['content-type']).toEqual("text/plain");
                        expect(res.statusCode).toEqual(404);
                        expect(body).toEqual("No Matching Response!\n");
                        done();
                    });
            });
        });
    });
});
