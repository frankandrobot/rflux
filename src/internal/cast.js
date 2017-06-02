/**
 * @param {Object} obj
 * @param {Class} Class
 * @returns {Class} instance of class
 * @private
 */
export default function cast(obj, Class) {

  return obj instanceof Class ? obj : new Class(obj)
}
