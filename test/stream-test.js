const request = require('request');
const util = require('util');
const crypto = require('crypto');
const hock = require('../');
const Readable = require('stream').Readable;
const {
    catchErrors,
    expectResponse,
    createHttpServer,
    createPort
} = require("./util.js");

describe("min() and max() with reply (with stream)", () => {
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

    function RandomStream(size, opt) {
        Readable.call(this, opt);
        this.lenToGenerate = size;
    }

    util.inherits(RandomStream, Readable);

    RandomStream.prototype._read = function(size) {
        if (!size) {
            size = 1024; // default size
        }
        let ready = true;
        while (ready) { // only cont while push returns true
            if (size > this.lenToGenerate) { // only this left
                size = this.lenToGenerate;
            }
            if (size) {
                ready = this.push(crypto.randomBytes(size));
                this.lenToGenerate -= size;
            }
            // when done, push null and exit loop
            if (!this.lenToGenerate) {
                this.push(null);
                ready = false;
            }
        }
    };

    const streamLen = 10000000; // 10Mb

    // NOTE: We need to specify encoding: null in requests below to ensure that the response is
    // not encoded as a utf8 string (we want the binary contents from the readstream returned.)
    it('should succeed with a single call', done => {
        testContext.hockInstance
            .get('/url')
            .reply(200, new RandomStream(streamLen));

        catchErrors(done, () => {
            request({'url': 'http://localhost:' + testContext.port + '/url', 'encoding': null}, (err, res, body) => {
                expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

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
            .reply(200, new RandomStream(streamLen));

        catchErrors(done, () => {
            request({'url': 'http://localhost:' + testContext.port + '/url', 'encoding': null}, (err, res, body) => {
                expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

                catchErrors(done, () => {
                    request({'url': 'http://localhost:' + testContext.port + '/url', 'encoding': null}, (err, res, body) => {
                        expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

                        testContext.hockInstance.done((err) => {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });
    });

    it('should have matching body with multiple calls', done => {
        testContext.hockInstance
            .get('/url')
            .twice()
            .reply(200, new RandomStream(1000));

        catchErrors(done, () => {
            request({'url': 'http://localhost:' + testContext.port + '/url', 'encoding': null}, (err, res, body1) => {
                expectResponse(err, res, body1.length, {statusCode: 200, expectedBody: 1000});

                catchErrors(done, () => {
                    request({'url': 'http://localhost:' + testContext.port + '/url', 'encoding': null}, (err, res, body2) => {
                        expectResponse(err, res, body2.length, {statusCode: 200, expectedBody: 1000});

                        expect(body1.toString()).toEqual(body2.toString());

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
