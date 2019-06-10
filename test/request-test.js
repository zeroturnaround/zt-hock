const Request = require('../lib/request');

describe('request', () => {
    it('should work with defined headers in the incoming request', () => {
        const request = new Request({}, {
            method: 'GET',
            url: '/lowercasetest',
            headers: { 'foo-type': 'artischocke' }
        });

        expect(request).toEqual(expect.objectContaining({
            method: 'GET',
            url: '/lowercasetest',
            headers: { 'foo-type': 'artischocke' }
        }));
    });

    it('should work with defined headers in the incoming request', () => {
        const request = new Request({}, {
            method: 'GET',
            url: '/lowercasetest',
            headers: { 'foo-type': 'artischocke' }
        });

        expect(request).toEqual(expect.objectContaining({
            method: 'GET',
            url: '/lowercasetest',
            headers: {'foo-type': 'artischocke'}
        }));
    });
});
