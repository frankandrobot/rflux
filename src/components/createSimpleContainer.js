import React from 'react'

import {nonObservableState, observableState} from '../internal/ContainerHelpers'
import {removeObservableState, setupObservableState} from '../internal/ContainerHelpers'


/**
 * If a prop is an observable, create a listener and pass the observed values as props.
 * Otherwise, pass the prop into the child component, which must be a stateless functional component.
 *
 * The use case is when you don't need access to other parts of the state.
 *
 * @param defaultState - the default container state
 * @param getInitialObservableState - passed to child container as props
 * @param containerDefaults - default props and propTypes of parent container
 * @returns {Function}
 */
export default function createContainer(
  {getInitialState = () => ({}), getInitialObservableState = () => ({}), containerDefaults = {}}) {

  const {propTypes = {}, getDefaultProps = () => undefined} = containerDefaults

  return StatelessFunctionalComponent => React.createClass({

    propTypes: propTypes,

    getInitialState() {
      return getInitialState.call(this)
    },

    getDefaultProps() {
      return getDefaultProps()
    },

    componentWillMount() {

      const _initialObservableState = getInitialObservableState.call(this)

      this._observableState = observableState(_initialObservableState)
      this._nonObservableState = nonObservableState(_initialObservableState)

      this._callbacks = setupObservableState(this, this._observableState)
    },

    componentWillUnmount() {

      removeObservableState(this._observableState, this._callbacks)
    },

    render() {
      return <StatelessFunctionalComponent {...this.state} {...this._nonObservableState} {...this.props} />
    }
  })
}
