const http = require('http');
const PORT = 5678;

module.exports = {
    createHttpServer(hockInstance, done) {
        const httpServer = http.createServer(hockInstance.handler).listen(PORT, (err) => {
            expect(err).toBeFalsy();
            expect(hockInstance).not.toBe(undefined);

            done();
        });

        return httpServer;
    },

    PORT: PORT,

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
