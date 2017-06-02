/**
 * instead of taking a dep on uuid, create a practically infinite sequence of ids.
 * Date.now() tweaked with a random number because it can actually return the same
 * values twice.
 * @returns {string} uuid
 * @private
 */
export default () => `${Date.now()}.${Math.random()}`
