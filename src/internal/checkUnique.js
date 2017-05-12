/**
 * Checks that the given prop occurs only once in the array of objects
 * @param {[]} arrayOfObjs
 * @param {String} prop
 * @param {String} msg
 */
export default function checkUnique(arrayOfObjs = [], prop, msg) {
  const hist = {}

  for(let item in arrayOfObjs) {
    hist[item[prop]] = (hist[item[prop]] || 0) + 1
    if (hist[item[prop]] >= 2) {
      throw new Error(`${msg}: ${item[prop]}`)
    }
  }
}
