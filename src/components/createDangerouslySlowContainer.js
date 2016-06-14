import React from 'react'

import {removeObservables, setupNonObservables, setupObservables} from '../internal/ContainerHelpers'


/**
 * Supports parent React props at the expense of potentially being inefficient:
 *
 * > Every #componentWillReceiveProps forces observer re-initialization.
 * > Therefore it is your responsibility to ensure that it doesn't get called too often.
 *
 * Since container props and state both get mapped as child props,
 * state overriddes props with the same name.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Function} getDefaultProps - container default props. Passed to child as props.
 * @param {Function} getInitialState - container initial state. Passed to child as props.
 * @param {Function} getObservableState - pass observables here. Observable *values* passed to child as props
 * @param {*} propTypes - container propTypes.
 * @returns {Function} that returns the container
 */
export default function createDangerouslySlowContainer({
  getDefaultProps = () => ({}),
  getInitialState = () => ({}),
  getObservableState = () => ({}),
  propTypes = {},
  __dangerouslyEnableSlowness = true
  }) {

  return StatelessFunctionalComponent => React.createClass({

    propTypes: propTypes,

    getInitialState() {
      return getInitialState.call(this)
    },

    getDefaultProps() {
      return getDefaultProps()
    },

    componentWillMount() {

      const observableState = getObservableState.call(this)

      setupNonObservables(this, observableState)
      setupObservables(this, observableState)
    },

    componentWillReceiveProps() {

      if (__dangerouslyEnableSlowness) {

        const observableState = getObservableState.call(this)

        removeObservables(this)
        setupObservables(this, observableState)
      }
    },

    componentWillUnmount() {

      removeObservables(this)
    },

    render() {
      return <StatelessFunctionalComponent {...this.props} {...this.state} />
    }
  })
}
