import React from 'react'
import _ from 'lodash'

import {isObservable} from './support/kefirUtils'


/**
 * If a prop is an observable, create a listener and pass the observed values as props.
 * Otherwise, pass the prop into the child component, which must be a stateless functional component.
 *
 * containerProps are props to pass to the container
 *
 * Note: container defaultProps get passed to child
 *
 * @param childProps to pass to child container
 * @param parentDefaultProps - default props and propTypes of parent container
 * @returns {Function}
 */
export default function createContainer(childProps = {}, parentDefaultProps = {}) {

  const observables = Object.keys(childProps)
    .filter(prop => isObservable(childProps[prop]))
    .map(prop => ({property: prop, observable: childProps[prop]}))

  const nonObservableProps = Object.keys(childProps)
    .filter(prop => !isObservable(childProps[prop]))
    .reduce((total, prop) => Object.assign(total, {[prop]: childProps[prop]}), {})

  const {propTypes = {}, getDefaultProps = _.noop} = parentDefaultProps

  return StatelessFunctionalComponent => React.createClass({

    propTypes: propTypes,

    getDefaultProps() {
      return getDefaultProps()
    },

    componentWillMount() {

      const that = this

      that.unsub = observables.map(
          obj => obj.observable._onValue(val => that.setState({[obj.property]: val}))
        ) || []
    },

    componentWillUnmount() {

      this.unsub.forEach(unsub => unsub())
    },

    render() {
      return <StatelessFunctionalComponent {...this.state} {...nonObservableProps} {...this.props} />
    }
  })
}
