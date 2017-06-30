const http = require('http');
const request = require('request');
const hock = require('../');
const PORT = 5678;

const expectResponse = require("./util.js").expectResponse;

describe("min() and max() with replyWithFile", function() {
    beforeEach(function(done) {
        this.hockInstance = hock.createHock();
        this.httpServer = http.createServer(this.hockInstance.handler).listen(PORT, (err) => {
            expect(err).toBeFalsy();
            expect(this.hockInstance).not.toBe(undefined);

            done();
        });
    });

    afterEach(function(done) {
        this.httpServer.close(done);
    });

    it('should succeed with a single call', function(done) {
        this.hockInstance
            .get('/url')
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        request('http://localhost:' + PORT + '/url', (err, res, body) => {
            expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

            this.hockInstance.done((err) => {
                expect(err).toBeFalsy();
                done();
            });
        });
    });

    it('should succeed with a multiple calls', function(done) {
        this.hockInstance
            .get('/url')
            .twice()
            .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

        request('http://localhost:' + PORT + '/url', (err, res, body) => {
            expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

            request('http://localhost:' + PORT + '/url', (err, res, body) => {
                expectResponse(err, res, body, {statusCode: 200, expectedBody: 'this\nis\nmy\nsample\n'});

                this.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });
});
