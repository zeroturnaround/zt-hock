const Request = require('./request');
const deepEqual = require('deep-equal');
const doesBodyMatch = require('./util/doesBodyMatch');

/**
 * This is the main class for Hock. It handles creation
 * of the underlying webserver, and enqueing all of the requests.
 *
 * @param {object}      [options]       options for your Hock server
 * @param {boolean}     [options.logOnUnmatched]  Tell Hock to log if receiving a request without a match (default=true)
 * @param {boolean}     [options.throwOnUnmatched]  Tell Hock to throw if receiving a request without a match (default=true)
 * @param {boolean}     [options.throwOnUnprocessedRequests]  Tell Hock to throw
 * if there are unprocessed requests in the assertion queue (default=true)
 *
 * @type {Function}
 */
class Hock {
    constructor(options) {
        options = options || {};
        this._logOnUnmatched = (typeof options.logOnUnmatched === 'boolean' ? options.logOnUnmatched : true);
        this._throwOnUnmatched = (typeof options.throwOnUnmatched === 'boolean' ? options.throwOnUnmatched : true);
        this._throwOnUnprocessedRequests = (typeof options.throwOnUnprocessedRequests === 'boolean' ?
            options.throwOnUnprocessedRequests : true);

        this._assertions = [];
        this.handler = Hock.prototype.handler.bind(this);
    }

    /**
     * enqueue a request into the queue
     *
     * @param {object}    request     The request to enter in the hock queue
     * @param request
     */
    enqueue(request) {
        if (this._requestFilter) {
            request._requestFilter = this._requestFilter;
        }

        if (this._defaultReplyHeaders) {
            request._defaultReplyHeaders = this._defaultReplyHeaders;
        }

        this._assertions.push(request);
    }

    /**
     * test if there is a request on the assertions queue
     *
     * @param {String}    method      the method of the request to match
     * @param {String}    url         the route of the request to match
     * @param {String}    [body]      optionally - use if you set a body
     * @param {object}    [headers]   optionally - use if you set a header
     * @returns {Boolean}
     */
    hasRoute(method, url, body, headers) {
        if (!body) {
            body = '';
        }

        if (!headers) {
            headers = {};
        }

        const found = this._assertions.filter(function(request) {
            return request.method === method &&
            request.url === url &&
            doesBodyMatch(request.body, body) &&
            deepEqual(request.headers, headers);
        });
        return !!found.length;
    }

    /**
     * Throw an error if there are unprocessed requests in the assertions queue.
     * If there are unfinsihed requests, i.e. min: 2, max 4 with a count of 2, that request will be
     * ignored for the purposes of throwing an error.
     *
     * @param {Function} cb
     */
    done(cb) {
        if (!this._throwOnUnprocessedRequests) {
            return cb && cb();
        }

        let err;
        if (this._assertions.length) {
            this._assertions = this._assertions.filter((request) => request.isDone());

            if (this._assertions.length) {
                err = new Error('Unprocessed Requests in Assertions Queue: \n' +
                    JSON.stringify(this._assertions.map((item) => item.method + ' ' + item.url)));
            }
        }

        if (!err) {
            return cb && cb();
        }

        if (!cb) {
            throw err;
        }

        return cb(err);
    }

    /**
     * enqueue a GET request into the assertion queue
     *
     * @param {String}    url         the route of the request to match
     * @param {object}    [headers]   optionally match the request headers
     * @returns {Request}
     */
    get(url, headers) {
        return new Request(this, {
            method: 'GET',
            url: url,
            headers: headers || {}
        });
    }

    /**
     * enqueue a HEAD request into the assertion queue
     *
     * @param {String}    url         the route of the request to match
     * @param {object}    [headers]   optionally match the request headers
     * @returns {Request}
     */
    head(url, headers) {
        return new Request(this, {
            method: 'HEAD',
            url: url,
            headers: headers || {}
        });
    }

    /**
     * enqueue a PUT request into the assertion queue
     *
     * @param {String}          url         the route of the request to match
     * @param {object|String}   [body]      the request body (if any) of the request to match
     * @param {object}          [headers]   optionally match the request headers
     * @returns {Request}
     */
    put(url, body, headers) {
        return new Request(this, {
            method: 'PUT',
            url: url,
            body: body || '',
            headers: headers || {}
        });
    }

    /**
     * enqueue a PATCH request into the assertion queue
     *
     * @param {String}          url         the route of the request to match
     * @param {object|String}   [body]      the request body (if any) of the request to match
     * @param {object}          [headers]   optionally match the request headers
     * @returns {Request}
     */
    patch(url, body, headers) {
        return new Request(this, {
            method: 'PATCH',
            url: url,
            body: body || '',
            headers: headers || {}
        });
    }

    /**
     * enqueue a POST request into the assertion queue
     *
     * @param {String}          url         the route of the request to match
     * @param {object|String}   [body]      the request body (if any) of the request to match
     * @param {object}          [headers]   optionally match the request headers
     * @returns {Request}
     */
    post(url, body, headers) {
        return new Request(this, {
            method: 'POST',
            url: url,
            body: body || '',
            headers: headers || {}
        });
    }

    /**
     * enqueue a DELETE request into the assertion queue
     *
     * @param {String}          url         the route of the request to match
     * @param {object|String}   [body]      the request body (if any) of the request to match
     * @param {object}          [headers]   optionally match the request headers
     * @returns {Request}
     */
    delete(url, body, headers) {
        return new Request(this, {
            method: 'DELETE',
            url: url,
            body: body || '',
            headers: headers || {}
        });
    }

    /**
     * enqueue a COPY request into the assertion queue
     *
     * @param {String}          url         the route of the request to match
     * @param {object|String}   [body]      the request body (if any) of the request to match
     * @param {object}          [headers]   optionally match the request headers
     * @returns {Request}
     */
    copy(url, body, headers) {
        return new Request(this, {
            method: 'COPY',
            url: url,
            headers: headers || {}
        });
    }

    /**
     * Provide a function to Hock to filter the request body
     *
     * @param {function}    filter    the function to filter on
     *
     * @returns {Hock}
     */
    filteringRequestBody(filter) {
        this._requestFilter = filter;
        return this;
    }

    /**
     * match incoming requests, and replace the body based on
     * a regular expression match
     *
     * @param {RegEx}       source    The source regular expression
     * @param {string}      replace   What to replace the source with
     *
     * @returns {Hock}
     */
    filteringRequestBodyRegEx(source, replace) {
        this._requestFilter = function({body}) {
            if (body) {
                body = body.replace(source, replace);
            }
            return body;
        };

        return this;
    }

    /**
     * Provide a function to Hock to filter request path
     *
     * @param {function}    filter    the function to filter on
     *
     * @returns {Hock}
     */
    filteringPath(filter) {
        this._pathFilter = filter;
        return this;
    }

    /**
     * match incoming requests, and replace the path based on
     * a regular expression match
     *
     * @param {RegEx}       source    The source regular expression
     * @param {string}      replace   What to replace the source with
     *
     * @returns {Hock}
     */
    filteringPathRegEx(source, replace) {
        this._pathFilter = function(path) {
            if (path) {
                path = path.replace(source, replace);
            }
            return path;
        };

        return this;
    }

    /**
     * clear the body request filter, if any
     *
     * @returns {Hock}
     */
    clearBodyFilter() {
        delete this._requestFilter;
        return this;
    }

    /**
     * set standard headers for all responses
     *
     * @param {object}    headers   the list of headers to send by default
     *
     * @returns {Hock}
     */
    defaultReplyHeaders(headers) {
        this._defaultReplyHeaders = headers;
        return this;
    }

    /**
     * Handle incoming requests
     *
     * @returns {Function}
     * @private
     */
    handler(req, res) {
        let matchIndex = null;

        req.body = '';

        req.on('data', (data) => {
            req.body += data.toString();
        });

        req.on('end', () => {
            for (let i = 0; i < this._assertions.length; i++) {
                if (this._assertions[i].isMatch(req)) {
                    matchIndex = i;
                    break;
                }
            }

            if (matchIndex === null) {
                if (this._throwOnUnmatched) {
                    throw new Error('No Match For: ' + req.method + ' ' + req.url);
                }

                if (this._logOnUnmatched) {
                    console.error('No Match For: ' + req.method + ' ' + req.url); // eslint-disable-line
                    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST') {
                        console.error(req.body); // eslint-disable-line
                    }
                }

                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('No Matching Response!\n');
            }
            else {
                if (this._assertions[matchIndex].sendResponse(res)) {
                    this._assertions.splice(matchIndex, 1)[0];
                }
            }
        });
    }
}

/**
 * static method for creating your hock server
 *
 * @param {object}      [options]       options for your Hock server
 * @param {Number}      [options.port]  port number for your Hock server
 * @param {boolean}     [options.throwOnUnmatched]  Tell Hock to throw if
 *    receiving a request without a match (Default=true)
 *
 * @returns {Hock}
 */
const createHock = function(options) {
    return new Hock(options);
};

module.exports = createHock;
module.exports.createHock = createHock;
