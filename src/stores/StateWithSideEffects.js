/**
 * Hey, look! Something like a monad
 */
export default class StateWithSideEffects {

  constructor(state, sideEffects) {

    this.state = state || {}
    this.sideEffects = sideEffects || []
  }

  combine(b) {

    return b instanceof StateWithSideEffects ?

      new StateWithSideEffects(
        {...this.state, ...b.state},
        this.sideEffects.concat(b.sideEffects)
      ) :

      new StateWithSideEffects(({...this.state, ...b}, this.sideEffects))
  }

  addSideEffects(...sideEffects) {

    return new StateWithSideEffects(
      {...this.state},
      this.sideEffects.concat(sideEffects)
    )
  }
}

/**
 * Constructor helper
 *
 * @param {*} state
 * @param {[]} sideEffects - array of side effects
 * @returns {StateWithSideEffects} instance
 */
export function state(state) {

  return new StateWithSideEffects(state)
}
