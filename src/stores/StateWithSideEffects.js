/**
 * Hey, look! Something like a monad
 */
export default class StateWithSideEffects {

  constructor(state, sideEffects) {

    this.state = state || {}
    this.sideEffects = sideEffects || []
  }

  combine(stateOrStateWithSideEffects) {

    return new StateWithSideEffects(
      {...this.state, ...stateOrStateWithSideEffects.state},
      this.sideEffects.concat(stateOrStateWithSideEffects.sideEffects)
    )
  }
}

/**
 * In a typed language this method wouldn't exist,
 * but since it's so easy to forget to return the proper class,
 * we add this to help prevent errors.
 *
 * @param {*} a
 * @param {*} b
 * @returns {StateWithSideEffects} instance
 */
export function combineStateWithSideEffects(a, b) {

  const aIsStateWithSideEffects = a instanceof StateWithSideEffects
  const bIsStateWithSideEffects = b instanceof StateWithSideEffects

  if (aIsStateWithSideEffects && bIsStateWithSideEffects) {

    return a.combine(b)
  }
  else if (!aIsStateWithSideEffects && !bIsStateWithSideEffects) {

    return new StateWithSideEffects({...a, ...b})
  }
  else if (aIsStateWithSideEffects && !bIsStateWithSideEffects) {

    return new StateWithSideEffects(({...a.state, ...b}, a.sideEffects))
  }
  else if (!aIsStateWithSideEffects && bIsStateWithSideEffects) {

    return new StateWithSideEffects({...a, ...b.state}, b.sideEffects)
  }
}

/**
 * Constructor helper
 *
 * @param {*} state
 * @param {[]} sideEffects - array of side effects
 * @returns {StateWithSideEffects} instance
 */
export function stateWithSideEffects(state, ...sideEffects) {

  return new StateWithSideEffects(state, sideEffects)
}

/**
 * Constructor helper
 *
 * @param {[]} sideEffects - array of side effects
 * @returns {StateWithSideEffects} instance with no state
 */
export function statelessSideEffects(...sideEffects) {

  return new StateWithSideEffects({}, sideEffects)
}
