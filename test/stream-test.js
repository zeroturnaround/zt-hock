const request = require('request');
const util = require('util');
const crypto = require('crypto');
const hock = require('../');
const Readable = require('stream').Readable;
const {
    expectResponse,
    createHttpServer,
    PORT
} = require("./util.js");

describe("min() and max() with reply (with stream)", function() {
    beforeEach(function(done) {
        this.hockInstance = hock.createHock();
        this.httpServer = createHttpServer(this.hockInstance, done);
    });

    afterEach(function(done) {
        this.httpServer.close(done);
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
    it('should succeed with a single call', function(done) {
        this.hockInstance
            .get('/url')
            .reply(200, new RandomStream(streamLen));

        request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, (err, res, body) => {
            expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

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
            .reply(200, new RandomStream(streamLen));

        request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, (err, res, body) => {
            expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

            request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, (err, res, body) => {
                expectResponse(err, res, body.length, {statusCode: 200, expectedBody: streamLen});

                this.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });

    it('should have matching body with multiple calls', function(done) {
        this.hockInstance
            .get('/url')
            .twice()
            .reply(200, new RandomStream(1000));

        request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, (err, res, body1) => {
            expectResponse(err, res, body1.length, {statusCode: 200, expectedBody: 1000});

            request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, (err, res, body2) => {
                expectResponse(err, res, body2.length, {statusCode: 200, expectedBody: 1000});

                expect(body1.toString()).toEqual(body2.toString());

                this.hockInstance.done((err) => {
                    expect(err).toBeFalsy();
                    done();
                });
            });
        });
    });
});
