const fs = require('fs');
const doesBodyMatch = require('./util/doesBodyMatch');

/**
 * This is the Request class for Hock. It represents a single request,
 * and the response to that request
 *
 * @param {object}      parent    the hock server this request belongs to
 * @param {object}      options
 * @param {String}      options.url         the route for the current request i.e. /foo/bar
 * @param {String|object}   [options.body]  optional request body
 *
 * @param {object}      [options.headers]   optional request headers
 * @param {object}      [options.method]    the method for the request (default=GET)
 *
 * @type {Function}
 */
module.exports = class Request {
    constructor(parent, options) {
        this.method = options.method || 'GET';
        this.url = options.url;
        this.body = options.body || '';
        this.headers = options.headers || {};

        if (typeof options.body === 'object') {
            this.body = JSON.stringify(options.body);
        }

        Object.keys(this.headers).forEach((key) => {
            this.headers[key.toLowerCase()] = this.headers[key];
            if (key.toLowerCase() !== key) {
                delete this.headers[key];
            }
        });

        this._defaultReplyHeaders = {};

        this._parent = parent;
        this._minRequests = 1;
        this._maxRequests = 1;
        this._count = 0;
    }

    /**
     * provide the mocked reply for the current request
     *
     * @param {Number}          [statusCode]    Status Code for the response (200)
     * @param {String|object}   [body]          The body for the response
     * @param {object}          [headers]       Headers for the response
     * @returns {*}
     */
    reply(statusCode, body, headers) {
        this.response = {
            statusCode: statusCode || 200,
            body: body || '',
            headers: headers
        };

        this._parent.enqueue(this);

        return this._parent;
    }

    /**
     * provide the mocked reply for the current request based on an input file
     *
     * @param {Number}          statusCode      Status Code for the response (200)
     * @param {String}          filePath        The path of the file to respond with
     * @param {object}          [headers]       Headers for the response
     * @returns {*}
     */
    replyWithFile(statusCode, filePath, headers) {
        this.response = {
            statusCode: statusCode || 200,
            body: fs.createReadStream(filePath),
            headers: headers
        };

        this._parent.enqueue(this);

        return this._parent;

    }

    /**
     * @decsription allow a request to match multiple queries at the same url.
     *
     * @param {object}    [options]       (default={min: 1, max: infinity})
     * @param {object}    [options.min]   minimum requests to be matched
     * @param {object}    [options.max]   max requests to be matched, must be >= min.
     * @returns {Request}
     */
    many(options) {
        options = options || {
            min: 1,
            max: Infinity
        };

        if (typeof options.min === 'number') {
            this._minRequests = options.min;
            if (this._minRequests > this._maxRequests) {
                this._maxRequests = this._minRequests;
            }
        }

        if (typeof options.max === 'number') {
            this._maxRequests = options.max;
        }

        return this;
    }

    /**
     * convenience function to provide a number for minimum requests
     *
     * @param {Number}    number    the value for min
     * @returns {Request}
     */
    min(number) {
        return this.many({ min: number });
    }

    /**
     * convenience function to provide a number for maximum requests
     *
     * @param {Number}    number    the value for max
     * @returns {Request}
     */
    max(number) {
        return this.many({ max: number });
    }

    /**
     * convenience function to set min, max to 1
     *
     * @returns {Request}
     */
    once() {
        return this.many({ min: 1, max: 1 });
    }

    /**
     * convenience function to set min, max to 2
     *
     * @returns {Request}
     */
    twice() {
        return this.many({ min: 1, max: 2 });
    }

    /**
     * convenience function to set min 0, max to Infinity
     *
     * @returns {Request}
     */
    any() {
        return this.many({ min: 0, max: Infinity });
    }

    /**
     * identify if the current request matches the provided request
     *
     * @param {object}      request   The request from the Hock server
     *
     * @returns {boolean|*}
     */
    isMatch(request) {
        if (this._parent._pathFilter) {
            request.url = this._parent._pathFilter(request.url);
        }

        if (request.method === 'GET' || request.method === 'DELETE') {
            return this.method === request.method && request.url === this.url && this._checkHeaders(request);
        }
        else {
            return this.method === request.method && this.url === request.url &&
                doesBodyMatch(this.body, request.body) && this._checkHeaders(request);
        }
    }

    _checkHeaders(request) {
        let match = true;
        Object.keys(this.headers).forEach((key) => {
            if (this.headers[key] && this.headers[key] !== request.headers[key]) {
                match = false;
            }
        });

        return match;
    }

    /**
     * send the response to the provided Hock response
     *
     * @param {object}    response    The response object from the hock server
     */
    sendResponse(response) {
        const self = this;

        this._count++;

        const headers = this.response.headers || this._defaultReplyHeaders;

        response.writeHead(this.response.statusCode, headers);

        if (this._isStream(this.response.body)) {
            const readStream = this.response.body;

            if (this._maxRequests > 1) {
                // Because we need to respond with this body more than once, if it is a stream,
                // we make a buffer copy and use that as the body for future responses.
                const data = [];

                readStream.on('readable', function() {
                    let chunk;
                    while ((chunk = readStream.read()) !== null) {
                        data.push(chunk);
                        response.write(chunk);
                    }
                });
                readStream.on('end', function() {
                    self.response.body = Buffer.concat(data);
                    response.end();
                });
            }
            else {
                readStream.pipe(response);
            }
        }
        else if ((typeof this.response.body === 'object') && !Buffer.isBuffer(this.response.body)) {
            response.end(JSON.stringify(this.response.body));
        }
        else {
            response.end(this.response.body);
        }

        return this.shouldPrune();
    }

    // From Nock
    _isStream(obj) {
        return obj &&
        (typeof a !== 'string') &&
        (! Buffer.isBuffer(obj)) &&
        typeof obj.setEncoding === 'function';
    }

    /**
     * Identify if the current request has met its min and max requirements
     *
     * @returns {boolean}
     */
    isDone() {
        return !(this._count >= this._minRequests && this._count <= this._maxRequests);
    }

    /**
     * Identify if the request has met its max requirement
     *
     * @returns {boolean}
     */
    shouldPrune() {
        return this._count >= this._maxRequests;
    }

    /**
     * @returns {Object}
     */
    toJSON() {
        return {
            method: this.method,
            url: this.url,
            body: this.body,
            headers: this.headers,
            stats: {
                count: this._count,
                min: this._minRequests,
                max: this._maxRequests,
                isDone: this.isDone(),
                shouldPrune: this.shouldPrune()
            }
        };
    }
}
