const request = require('request');
const hock = require('../');
const {
    catchErrors,
    expectResponse,
    createHttpServer,
    createPort
} = require("./util.js");

describe("min() and max() with replyWithFile", function() {
    beforeEach(function(done) {
        this.port = createPort();
        this.hockInstance = hock.createHock();
        this.httpServer = createHttpServer(this.hockInstance, this.port, done);
    });

    afterEach(function(done) {
        this.httpServer.close(done);
    });

    it('should succeed with a single call', function(done) {
        this.hockInstance
            .get('/url')
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

                this.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    it('should succeed with a multiple calls', function(done) {
        this.hockInstance
            .get('/url')
            .twice()
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        request('http://localhost:' + this.port + '/url', (err, res, body) => {
            catchErrors(done, () => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

                request('http://localhost:' + this.port + '/url', (err, res, body) => {
                    catchErrors(done, () => {
                        expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

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
