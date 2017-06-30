const http = require('http');

module.exports = {
    createHttpServer(hockInstance, port, done) {
        const httpServer = http.createServer(hockInstance.handler).listen(port, (err) => {
            expect(err).toBeFalsy();
            expect(hockInstance).not.toBe(undefined);

            // Delay to reduce flakyness on Travis
            setTimeout(() => done(), 250);
        });

        return httpServer;
    },

    createPort() {
        return Math.floor(Math.random() * (6000 - 5000)) + 5000;
    },

    expectResponse(err, res, body, {statusCode, expectedBody}) {
        expect(err).toBeFalsy();
        expect(res.statusCode).toEqual(statusCode);
        expect(body).toEqual(expectedBody);
    },

    /**
     * In async tests, JEST will die (in watch mode) if an exception is thrown from a callback. This utility will catch
     * the errors instead and report the test as failed in these case *
     *
     * @param {jest.DoneCallback} done
     * @param {Function} callback
     * @returns {Function}
     */
    catchErrors(done, callback) {
        try {
            callback();
        }
        catch (e) {
            done.fail(e);
        }
    }
};