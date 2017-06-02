/**
 * Hey, look! Something like a monad (dang, forget I said the "m" word.)
 *
 * `StateWithSideEffects` is basically state plus an array of messages (the side
 * effects to be executed).
 *
 * You can combine it with State or with another StateWithSideEffects, or add side
 * effects to an existing StateWithSideEffects.
 */
export default class StateWithSideEffects {

  /**
   * @param {State} state
   * @param {Message[]} sideEffects
   */
  constructor(state, sideEffects) {

    this.state = state || {}
    this.sideEffects = sideEffects || []
  }

  /**
   * Can combine `StateWithSideEffects` with another `StateWithSideEffects` or with state.
   * @param {StateWithSideEffects|State} b
   * @returns {StateWithSideEffects} the result
   */
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
 * @param {State} state
 * @returns {StateWithSideEffects} instance
 */
export function state(state = {}) {

  return new StateWithSideEffects(state)
}
