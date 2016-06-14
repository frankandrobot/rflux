/* eslint no-use-before-define:0 */
import React from 'react'

import {nonObservableState, observableState} from '../internal/ContainerHelpers'
import {removeObservableState, setupObservableState} from '../internal/ContainerHelpers'


/**
 * The differences between this class and createContainer is:
 *
 * 1. Everything (including observables) is done via React props (not state and props)
 * 2. That means observers need to be recreated each time the Container's props change.
 *    (Hence, the "dangerously slow" name. Recreating observers on prop changes can be slow).
 * 3. The use case is when you need observers that depend on React prop values.
 *
 * # Usage
 *
 * Unless you need to set defaultProps, you do NOT need to inherit from this class.
 * Instead you can use it directly.
 *
 * ```javascript
 * render() {
 *   // "Child" has *values* from `observable` (not the stream itself) available as props.
 *   return (
 *     <RFluxDangerouslySlowContainer observable1={observable1}>
 *        <Child/>
 *     </RFluxDangerouslySlowContainer>
 *   )
 * }
 * ```
 */
export default class RFluxDangerouslySlowContainer extends React.Component {

  constructor(props) {

    super(props)
  }

  componentWillMount() {

    this.normalProps = nonObservableState(this.props)
    this.observables = observableState(this.props)
    this.callbacks = setupObservableState(this, this.observables, this.props.children.type.defaultProps)
  }

  componentWillReceiveProps(nextProps) {

    this.normalProps = nonObservableState(nextProps)

    //unsub previous
    removeObservableState(this.observables, this.callbacks)

    //subscribe new
    this.observables = observableState(nextProps)
    this.callbacks = setupObservableState(this, this.observables, this.props.children.type.defaultProps)
  }

  componentWillUnmount() {

    removeObservableState(this.observables, this.callbacks)
  }

  render() {

    return {
      type: this.props.children.type,
      ['$$typeof']: Symbol.for('react.element'),
      props: {...this.state, ...this.normalProps}
    }
  }
}
