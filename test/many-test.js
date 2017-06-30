const request = require('request');
const hock = require('../');
const {
    catchErrors,
    expectResponse,
    createHttpServer,
    createPort
} = require("./util.js");

describe("with minimum requests", function() {
    beforeEach(function(done) {
        this.port = createPort();
        this.hockInstance = hock.createHock();
        this.httpServer = createHttpServer(this.hockInstance, this.port, done);
    });

    afterEach(function(done) {
        this.httpServer.close(done);
    });

    it('should succeed with once', function(done) {
        this.hockInstance
            .get('/url')
            .once()
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                this.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    describe('with min: 2 and a single request', function() {
        beforeEach(function() {
            this.hockInstance
                .get('/url')
                .min(2)
                .reply(200, { 'hock': 'ok' });
        });

        it('returns error when done callback is present', function(done) {
            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    this.hockInstance.done((err) => {
                        expect(err.message.includes("Unprocessed Requests in Assertions Queue:")).toEqual(true);
                        done();
                    });
                });
            });
        });

        it('should throw no done callback is present', function(done) {
            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    expect(() => this.hockInstance.done()).toThrow();
                    done();
                });
            });
        });
    });

    it('should succeed with min:2 and 2 requests', function(done) {
        this.hockInstance
            .get('/url')
            .min(2)
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    this.hockInstance.done((err) => {
                        expect(err).toBeFalsy();
                        done();
                    });
                });
            });
        });
    });

    it('should succeed with max:2 and 1 request', function(done) {
        this.hockInstance
            .get('/url')
            .max(2)
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

            this.hockInstance.done((err) => {
                expect(err).toBeFalsy();
                done();
            });
        });
    });

    it('should succeed with max:2 and 2 requests', function(done) {
        this.hockInstance
            .get('/url')
            .max(2)
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                request('http://localhost:' + this.port + '/url', (err, res, body) => {
                    catchErrors(done, () => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        this.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with min:2, max:3 and 2 requests', function(done) {
        this.hockInstance
            .get('/url')
            .min(2)
            .max(3)
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                request('http://localhost:' + this.port + '/url', (err, res, body) => {
                    catchErrors(done, () => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        this.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with min:2, max:Infinity and 2 requests', function(done) {
        this.hockInstance
            .get('/url')
            .min(2)
            .max(Infinity)
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                request('http://localhost:' + this.port + '/url', (err, res, body) => {
                    catchErrors(done, () => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        this.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should succeed with 2 different routes with different min, max values', function(done) {
        this.hockInstance
            .get('/url')
            .min(2)
            .max(3)
            .reply(200, { 'hock': 'ok' })
            .get('/asdf')
            .once()
            .reply(200, { 'hock': 'ok' });

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                request('http://localhost:' + this.port + '/asdf', (err, res, body) => {
                    catchErrors(done, () => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                        request('http://localhost:' + this.port + '/url', (err, res, body) => {
                            catchErrors(done, () => {
                                expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                this.hockInstance.done((err) => {
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

    describe('many()', function() {
        describe('with no requests', function() {
            beforeEach(function() {
                this.hockInstance
                    .get('/url')
                    .many()
                    .reply(200, { 'hock': 'ok' });
            });

            it('should fail with error when done callback is present', function(done) {
                this.hockInstance.done((err) => {
                    expect(err.message.includes("Unprocessed Requests in Assertions Queue:")).toEqual(true);
                    done();
                });
            });

            it('should throw when no done callback is present', function(done) {
                expect(() => this.hockInstance.done()).toThrow();
                done();
            });
        });

        it('should succeed with many requests', function(done) {
            this.hockInstance
                .get('/url')
                .many()
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    request('http://localhost:' + this.port + '/url', (err, res, body) => {
                        catchErrors(done, () => {
                            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                                catchErrors(done, () => {
                                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                    this.hockInstance.done((err) => {
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

    describe('any', function() {
        it('should succeed with no requests', function(done) {
            this.hockInstance
                .get('/url')
                .any()
                .reply(200, { 'hock': 'ok' });

            this.hockInstance.done((err) => {
                expect(err).toBeFalsy();
                done();
            });
        });

        it('should succeed with many requests', function(done) {
            this.hockInstance
                .get('/url')
                .any()
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                catchErrors(done, () => {
                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                    request('http://localhost:' + this.port + '/url', (err, res, body) => {
                        catchErrors(done, () => {
                            expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                            request('http://localhost:' + this.port + '/url', (err, res, body) => {
                                catchErrors(done, () => {
                                    expectResponse(err, res, body, {statusCode: 200, expectedBody: JSON.stringify({ 'hock': 'ok' })});

                                    this.hockInstance.done((err) => {
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
