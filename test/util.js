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
    }
};
