/**
 * Checks that the given prop occurs only once in the array of objects
 * @param {[]} arrayOfObjs
 * @param {String} prop
 * @param {String} msg
 */
export default function checkUnique(arrayOfObjs = [], prop, msg) {
  const hist = {}

  for(let i in arrayOfObjs) {
    const item = arrayOfObjs[i]

    hist[item[prop]] = (hist[item[prop]] || 0) + 1
    if (hist[item[prop]] >= 2) {
      throw new Error(`${msg}: ${item[prop]}`)
    }
  }
}
