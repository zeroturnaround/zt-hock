module.exports = {
    expectResponse(err, res, body, {statusCode, expectedBody}) {
        expect(err).toBeFalsy();
        expect(res.statusCode).toEqual(statusCode);
        expect(body).toEqual(expectedBody);
    }
};
