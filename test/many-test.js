const http = require('http');
const request = require('request');
const util = require('util');
const crypto = require('crypto');
const hock = require('../');

const PORT = 5678;

describe('Hock Multiple Request Tests', function() {

    let hockInstance;
    let httpServer;

    describe("With minimum requests", function() {
        beforeEach(function(done) {
            hockInstance = hock.createHock();
            httpServer = http.createServer(hockInstance.handler).listen(PORT, function(err) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);

                done();
            });
        });

        afterEach(function(done) {
            httpServer.close(done);
        });

        it('should succeed with once', function(done) {
            hockInstance
                .get('/url')
                .once()
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                hockInstance.done();
                done();
            });
        });

        it('should fail with min: 2 and a single request', function(done) {
            hockInstance
                .get('/url')
                .min(2)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});
                expect(() => hockInstance.done()).toThrow();

                done();
            });
        });

        it('should succeed with min:2 and 2 requests', function(done) {
            hockInstance
                .get('/url')
                .min(2)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    hockInstance.done();
                    done();
                });
            });
        });

        it('should succeed with max:2 and 1 request', function(done) {
            hockInstance
                .get('/url')
                .max(2)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                hockInstance.done();
                done();
            });
        });

        it('should succeed with max:2 and 2 requests', function(done) {
            hockInstance
                .get('/url')
                .max(2)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    hockInstance.done();
                    done();
                });
            });
        });

        it('should succeed with min:2, max:3 and 2 requests', function(done) {
            hockInstance
                .get('/url')
                .min(2)
                .max(3)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    hockInstance.done();
                    done();
                });
            });
        });

        it('should succeed with min:2, max:Infinity and 2 requests', function(done) {
            hockInstance
                .get('/url')
                .min(2)
                .max(Infinity)
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    hockInstance.done();
                    done();
                });
            });
        });

        it('should succeed with 2 different routes with different min, max values', function(done) {
            hockInstance
                .get('/url')
                .min(2)
                .max(3)
                .reply(200, { 'hock': 'ok' })
                .get('/asdf')
                .once()
                .reply(200, { 'hock': 'ok' });

            request('http://localhost:' + PORT + '/url', function(err, res, body) {
                expect(err).toBeFalsy();
                expect(hockInstance).not.toBe(undefined);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                request('http://localhost:' + PORT + '/asdf', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    request('http://localhost:' + PORT + '/url', function(err, res, body) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                        hockInstance.done();
                        done();
                    });
                });
            });
        });

        describe('min() and max() with replyWithFile', function() {
            it('should succeed with a single call', function(done) {
                hockInstance
                    .get('/url')
                    .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual('this\nis\nmy\nsample\n');

                    hockInstance.done(function(err) {
                        expect(err).toBeFalsy();
                        done();
                    });
                });
            });

            it('should succeed with a multiple calls', function(done) {
                hockInstance
                    .get('/url')
                    .twice()
                    .replyWithFile(200, process.cwd() + '/test/data/hello.txt');

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body).toEqual('this\nis\nmy\nsample\n');

                    request('http://localhost:' + PORT + '/url', function(err, res, body) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(body).toEqual('this\nis\nmy\nsample\n');

                        hockInstance.done(function(err) {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });

        describe('min() and max() with reply (with stream)', function() {

            const Readable = require('stream').Readable;

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
                hockInstance
                    .get('/url')
                    .reply(200, new RandomStream(streamLen));

                request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body.length).toEqual(streamLen);

                    hockInstance.done(function(err) {
                        expect(err).toBeFalsy();
                        done();
                    });
                });
            });

            it('should succeed with a multiple calls', function(done) {
                hockInstance
                    .get('/url')
                    .twice()
                    .reply(200, new RandomStream(streamLen));

                request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body.length).toEqual(streamLen);

                    request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, function(err, res, body) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(body.length).toEqual(streamLen);

                        hockInstance.done(function(err) {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });

            it('should have matching body with multiple calls', function(done) {
                hockInstance
                    .get('/url')
                    .twice()
                    .reply(200, new RandomStream(1000));

                request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, function(err, res, body1) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(body1.length).toEqual(1000);

                    request({'url': 'http://localhost:' + PORT + '/url', 'encoding': null}, function(err, res, body2) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(body2.length).toEqual(1000);
                        expect(body1.toString()).toEqual(body2.toString());

                        hockInstance.done(function(err) {
                            expect(err).toBeFalsy();
                            done();
                        });
                    });
                });
            });
        });

        describe('many()', function() {

            it('should fail with no requests', function(done) {
                hockInstance
                    .get('/url')
                    .many()
                    .reply(200, { 'hock': 'ok' });

                expect(() => hockInstance.done()).toThrow();

                done();
            });

            it('should succeed with many requests', function(done) {
                hockInstance
                    .get('/url')
                    .many()
                    .reply(200, { 'hock': 'ok' });

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    request('http://localhost:' + PORT + '/url', function(err, res, body) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                        request('http://localhost:' + PORT + '/url', function(err, res, body) {
                            expect(err).toBeFalsy();
                            expect(hockInstance).not.toBe(undefined);
                            expect(res.statusCode).toEqual(200);
                            expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                            hockInstance.done();
                            done();
                        });
                    });
                });
            });
        });

        describe('any', function() {
            it('should succeed with no requests', function(done) {
                hockInstance
                    .get('/url')
                    .any()
                    .reply(200, { 'hock': 'ok' })
                    .done();
                done();
            });

            it('should succeed with many requests', function(done) {
                hockInstance
                    .get('/url')
                    .any()
                    .reply(200, { 'hock': 'ok' });

                request('http://localhost:' + PORT + '/url', function(err, res, body) {
                    expect(err).toBeFalsy();
                    expect(hockInstance).not.toBe(undefined);
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                    request('http://localhost:' + PORT + '/url', function(err, res, body) {
                        expect(err).toBeFalsy();
                        expect(hockInstance).not.toBe(undefined);
                        expect(res.statusCode).toEqual(200);
                        expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                        request('http://localhost:' + PORT + '/url', function(err, res, body) {
                            expect(err).toBeFalsy();
                            expect(hockInstance).not.toBe(undefined);
                            expect(res.statusCode).toEqual(200);
                            expect(JSON.parse(body)).toEqual({'hock': 'ok'});

                            hockInstance.done();
                            done();
                        });
                    });
                });
            });
        });
    });
});
