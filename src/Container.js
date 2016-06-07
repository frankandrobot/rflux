/* eslint no-use-before-define:0 */
import React from 'react'

import {isObservable} from './support/kefirUtils'


/**
 * In the props you pass normal properties and observables.
 * The observables is where the magic is---for each observable, add a listener,
 * and set the state of the Container equal to the observed value.
 * For example, if props = {obs1: observable} and the observed values are a, b, c...,
 * then this.state.obs1 = a, b, c, ...
 * Container then passes this state to its child as props.
 *
 * There are several ways to solve the problem of passing observables to components:
 * 1. stores manage transient state
 * ```
 * const docStore = {
 *   docs: {},
 *   curDocUuid: null,
  *  newDocUui: null
 * }
 * ```
 * in the above, the docStore manages curDocUuid and newDocUuid. This seems like a job for the app
 *
 * 2. pass transient state view props to child components.
 *    This option is problematic when a *stream* is a function of a prop.
 *    The reason is because with each prop change, the previous observers need to be killed.
 *
 *    That's obviously bad and including Container makes for a hard-to-use API
 *
 * ```
 * export function docObservable(docsObservable) {

  return uuid =>
    docsObservable
      .map(state => state.docs[uuid])
      .filter(doc => doc)
  }
  ```
 * 3. create observables that return parent objects, then pick out desired object in View.
 *    The obvious downside is that the internals of the state leaks out into the View.
 *    This makes it harder to refactor.
 *
 * 4. use other store action observables in an action observable.
 *    This is a variation of #3. Indirect relationships are bad for maintainability.
 *
 * 5. the last option is to use a variation of #3. *Create helper methods that pick out desired properties from a
 *    parent object*.
 *
 * @deprecated use createContainer
 */
export default class Container extends React.Component {

  constructor(props) {

    super(props)
  }

  componentWillMount() {

    this.normalProps = _normalProps(this.props)
    _setupObservables(this, this.props)
  }

  componentWillReceiveProps(nextProps) {

    this.normalProps = _normalProps(nextProps)

    //unsub previous
    _unsubscribe(this.observables, this.callbacks)

    //subscribe new
    _setupObservables(this, nextProps)
  }

  componentWillUnmount() {

    _unsubscribe(this.observables, this.callbacks)
  }

  render() {

    return {
      type: this.props.children.type,
      ['$$typeof']: Symbol.for('react.element'),
      props: {...this.state, ...this.normalProps}
    }
  }
}

function _setupObservables(component, props) {

  component.observables = _observables(props)
  component.callbacks = _callbacks(component, component.observables)
  component.setState(
    props.children.type.defaultProps || {},
    () => _subscribe(component.observables, component.callbacks)
  )
}

function _observables(props) {

  return Object.keys(props)
      .filter(prop => isObservable(props[prop]))
      .map(prop => ({property: prop, observable: props[prop]})) || []
}

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param component
 * @param observables
 * @private
 */
function _callbacks(component, observables) {

  return observables.map(obj => val => {
    component.setState({[obj.property]: val})
  })
}

function _subscribe(observables, callbacks) {

  observables.forEach((obj, i) => obj.observable.onValue(callbacks[i]))
}

function _unsubscribe(observables, callbacks) {

  observables.forEach((obj, i) => obj.observable.offValue(callbacks[i]))
}

function _normalProps(props) {

  return Object.keys(props)
    .filter(prop => !isObservable(props[prop]) && prop !== 'children')
    .reduce((total, prop) => Object.assign(total, {[prop]: props[prop]}), {})
}
