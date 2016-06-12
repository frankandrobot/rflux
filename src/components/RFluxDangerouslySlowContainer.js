/* eslint no-use-before-define:0 */
import React from 'react'

import {nonObservableState, observableState} from '../internal/ContainerHelpers'
import {removeObservableState, setupObservableState} from '../internal/ContainerHelpers'


/**
 * The differences between this class and RFluxContainer is:
 *
 * 1. You setup the observable via React props (not state)
 * 2. That means observers need to be recreated each time the Container's props change.
 *    (Hence, the "dangerously slow" name. Recreating observers on prop changes can be slow).
 * 3. You do NOT inherit from this class. Instead you can use it directly.
 *
 * ```javascript
 * render() {
 *   // "Child" has *values* from `observable` (not the stream itself) available as props.
 *   return <Container observable1={observable1}> <Child/> </Container>
 * }
 * ```
 */
export default class RFluxDangerouslySlowContainer extends React.Component {

  constructor(props) {

    super(props)
  }

  componentWillMount() {

    this.normalProps = nonObservableState(this.props)
    this.observables = observableState(this, this.props)

    setupObservableState(this, this.observables)
  }

  componentWillReceiveProps(nextProps) {

    this.normalProps = nonObservableState(nextProps)

    //unsub previous
    removeObservableState(this.observables, this.callbacks)

    //subscribe new
    this.observables = observableState(nextProps)
    setupObservableState(this, nextProps)
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
