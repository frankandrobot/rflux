import React from 'react'

import {nonObservableState, observableState} from '../internal/ContainerHelpers'
import {removeObservableState, setupObservableState} from '../internal/ContainerHelpers'


/**
 * The container passes React props and state to its child as props.
 * The main feature is that it converts observables into *values*...
 * while automagically managing the observer lifecycle.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * ```javascript
 * createContainer({
 *   getObservableState() {
 *     return {
 *       value: observable.map(x => x.foo)
 *     }
 *   }
 * })(Child)
 *
 * const Child = value => <div>{value}</div> //gets the value of the observable as a prop!
 * ```
 *
 * @param getInitialState - container initial state. Passed to child as props.
 * @param getObservableState - pass observables here. Observable *values* passed to child as props
 * @param getDefaultProps - container default props. Passed to child as props.
 * @param propTypes - container propTypes.
 * @returns {Function}
 */
export default function createContainer({
  getInitialState = () => ({}),
  getObservableState = () => ({}),
  getDefaultProps = () => ({}),
  propTypes = {}}) {

  return StatelessFunctionalComponent => React.createClass({

    propTypes: propTypes,

    getInitialState() {
      return getInitialState.call(this)
    },

    getDefaultProps() {
      return getDefaultProps()
    },

    componentWillMount() {

      const _observableState = getObservableState.call(this)
      const _nonObservableState = nonObservableState(_observableState)

      this.setState(_nonObservableState)

      this._observableState = observableState(_observableState)
      this._callbacks = setupObservableState(this, this._observableState)
    },

    componentWillUnmount() {

      removeObservableState(this._observableState, this._callbacks)
    },

    render() {
      return <StatelessFunctionalComponent {...this.state} {...this.props} />
    }
  })
}
