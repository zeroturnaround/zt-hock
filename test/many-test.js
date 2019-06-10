const request = require('request');
const hock = require('../');
const {
    catchErrors,
    expectResponse,
    createHttpServer,
    createPort
} = require("./util.js");

describe("with minimum requests", () => {
    let testContext;

    beforeEach(() => {
        testContext = {};
    });

    beforeEach(done => {
        testContext.port = createPort();
        testContext.hockInstance = hock.createHock();
        testContext.httpServer = createHttpServer(testContext.hockInstance, testContext.port, done);
    });

    afterEach(done => {
        testContext.httpServer.close(done);
    });

    it('should succeed with once', done => {
        testContext.hockInstance
            .get('/url')
            .once()
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                testContext.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    describe('with min: 2 and a single request', () => {
        it('returns error when done callback is present', done => {
            testContext.hockInstance
                .get('/url')
                .min(2)
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    testContext.hockInstance.done((err) => {
                        expect(err.message.includes("Unprocessed Requests in Assertions Queue:")).toEqual(true);
                        done();
                    });
                });
            });
        });

        it('should throw no done callback is present', done => {
            testContext.hockInstance
                .get('/url')
                .min(2)
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    expect(() => testContext.hockInstance.done()).toThrow();
                    done();
                });
            });
        });
    });

    it('should succeed with min:2 and 2 requests', done => {
        testContext.hockInstance
            .get('/url')
            .min(2)
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        testContext.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with max:2 and 1 request', done => {
        testContext.hockInstance
            .get('/url')
            .max(2)
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                testContext.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    it('should succeed with max:2 and 2 requests', done => {
        testContext.hockInstance
            .get('/url')
            .max(2)
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        testContext.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with min:2, max:3 and 2 requests', done => {
        testContext.hockInstance
            .get('/url')
            .min(2)
            .max(3)
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        testContext.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with min:2, max:Infinity and 2 requests', done => {
        testContext.hockInstance
            .get('/url')
            .min(2)
            .max(Infinity)
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        testContext.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with 2 different routes with different min, max values', done => {
        testContext.hockInstance
            .get('/url')
            .min(2)
            .max(3)
            .reply(200, { 'hock': 'ok' })
            .get('/asdf')
            .once()
            .reply(200, { 'hock': 'ok' });

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/asdf', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        catchErrors(done, () => {
                            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                testContext.hockInstance.done((err) => {
                                    expect(err).toBeFalsy();
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('many()', () => {
        describe('with no requests', () => {
            beforeEach(() => {
                testContext.hockInstance
                    .get('/url')
                    .many()
                    .reply(200, { 'hock': 'ok' });
            });

            it('should fail with error when done callback is present', done => {
                testContext.hockInstance.done((err) => {
                    expect(err.message.includes("Unprocessed Requests in Assertions Queue:")).toEqual(true);
                    done();
                });
            });

            it('should throw when no done callback is present', done => {
                expect(() => testContext.hockInstance.done()).toThrow();
                done();
            });
        });

        it('should succeed with many requests', done => {
            testContext.hockInstance
                .get('/url')
                .many()
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    catchErrors(done, () => {
                        request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                            catchErrors(done, () => {
                                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                    testContext.hockInstance.done((err) => {
                                        expect(err).toBeFalsy();
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('any', () => {
        it('should succeed with no requests', done => {
            testContext.hockInstance
                .get('/url')
                .any()
                .reply(200, { 'hock': 'ok' });

            testContext.hockInstance.done((err) => {
                expect(err).toBeFalsy();
                done();
            });
        });

        it('should succeed with many requests', done => {
            testContext.hockInstance
                .get('/url')
                .any()
                .reply(200, { 'hock': 'ok' });

            catchErrors(done, () => {
                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    catchErrors(done, () => {
                        request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                            catchErrors(done, () => {
                                request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                    testContext.hockInstance.done((err) => {
                                        expect(err).toBeFalsy();
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
