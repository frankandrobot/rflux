/* eslint no-use-before-define:0 */
import React from 'react'

import {setupNonObservables, setupObservables, removeObservables} from '../internal/ContainerHelpers'


/**
 * Natural interface---just wrap a child view in this container class and pass values via props.
 * No complex state functions.
 * Because it supports parent React props, it can be inefficient for arbitrary prop changes.
 */
export default class DangerouslySlowContainer extends React.Component {

  constructor(props, __dangerouslyEnableSlowness) {

    super(props)

    this.__dangerouslyEnableSlowness = __dangerouslyEnableSlowness
  }

  componentWillMount() {

    setupNonObservables(this, this.props, false)
    setupObservables(this, this.props, this.props.children.type.defaultProps)
  }

  componentWillReceiveProps(nextProps) {

    if (this.__dangerouslyEnableSlowness) {

      removeObservables(this)
      setupNonObservables(this, nextProps, false)
      setupObservables(this, nextProps, this.props.children.type.defaultProps)
    }
  }

  componentWillUnmount() {

    removeObservables(this)
  }

  render() {

    return {
      type: this.props.children.type,
      ['$$typeof']: Symbol.for('react.element'),
      props: {...this.state, ...this.normalProps}
    }
  }
}
