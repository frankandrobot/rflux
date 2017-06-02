/**
 * @param {expresson} condition boolean expression
 * @param {string} message
 * @returns {void}
 * @private
 */
export default function assert(condition, message) {

  if (!condition) { throw new Error(message) }
}
