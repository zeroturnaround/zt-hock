const request = require('request');
const hock = require('../');
const {
    catchErrors,
    expectResponse,
    createHttpServer,
    createPort
} = require("./util.js");

describe("min() and max() with replyWithFile", () => {
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

    it('should succeed with a single call', done => {
        testContext.hockInstance
            .get('/url')
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

                testContext.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    it('should succeed with a multiple calls', done => {
        testContext.hockInstance
            .get('/url')
            .twice()
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        catchErrors(done, () => {
            request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

                catchErrors(done, () => {
                    request('http://localhost:' + testContext.port + '/url', (err, res, body) => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

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
