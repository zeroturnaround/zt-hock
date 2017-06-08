const deepEqual = require("deep-equal");

/**
 * Checks if bodies matches. First tries to parse both bodies to a json object
 * and then deep equals compares the objects.
 *
 * If the bodies cannot be parsed into an object, then it compares the Strings.
 *
 * @param {String} bodyA
 * @param {String} bodyB
 * @returns {Boolean}
 */
module.exports = function doesBodyMatch(bodyA, bodyB) {
    try {
        const parsedBodyA = JSON.parse(bodyA);
        const parsedBodyB = JSON.parse(bodyB);
        return deepEqual(parsedBodyA, parsedBodyB);
    } catch (e) { // Error parsing, compare strings.
        return bodyA === bodyB;
    }
}
