/**
 * All this does is save typing when creating actionTypes.
 * If I'm not mistaken keymirror does the same thing
 *
 * @param actions
 * @returns {*}
 */
export default function createTypes(actions) {

  actions = actions || []
  actions = Array.isArray(actions) ? actions : [actions]

  return actions.reduce((total, arg) => Object.assign(total, {[arg]: arg}), {})
}
