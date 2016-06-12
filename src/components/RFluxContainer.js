import React from 'react'

import {nonObservableState, observableState} from '../internal/ContainerHelpers'
import {removeObservableState, setupObservableState} from '../internal/ContainerHelpers'

/**
 * The difference between this class RFluxDangerouslySlowContainer is:
 *
 * 1. You set observables via React state (not props).
 *    This means that you set observables exactly once for the life of the component.
 *    See below for a workaround.
 * 2. You need to inherit this class in order to use it.
 * 3. The use case is when you need access to parts of the state (most cases).
 *
 * ```javascript
 * class Container extends RFluxContainer {
 *   constructor(props) {
 *     super(props);
 *     this.state = { foo: 'initial value' }
 *   }
 *
 *   getInitialObservableState() {
 *      return {
 *         foo: observable1,
 *         randomfoo: () => this.setState({foo: Math.random()})
 *      }
 *   }
 * }
 *
 * export default () => <Container> <Child/> </Container>
 * ```
 *
 * # What if observables are functions of React properties?
 *
 * Actually this probably isn't an issue anymore.
 * If so then RFFluxDangerouslySlowContainer can be safely deprecated.
 */
export default class RFluxContainer extends React.Component {

  constructor(props) {

    super(props)

    const noop = () => ({})
    const initialState = (this.getInitialObservableState || noop)()

    this._observableState = observableState(initialState)
    this._nonObservableState = nonObservableState(initialState)
  }

  componentWillMount() {

    this._callbacks = setupObservableState(this, this._observableState, this.state)
  }

  componentWillUnmount() {

    removeObservableState(this._observableState, this._callbacks)
  }

  render() {

    return {
      type: this.reprops.children.type,
      ['$$typeof']: Symbol.for('react.element'),
      props: {...this.state, ...this._nonObservableState}
    }
  }
}
