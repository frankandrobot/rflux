import isObservable from '../internal/isObservable'


export function observables(stateOrProps) {

  return Object.keys(stateOrProps)
      .filter(prop => isObservable(stateOrProps[prop]))
      .map(prop => ({name: prop, observable: stateOrProps[prop]})) || []
}

export function nonObservables(stateOrProps) {

  return Object.keys(stateOrProps)
    .filter(prop => !isObservable(stateOrProps[prop]) && prop !== 'children')
    .reduce((total, prop) => Object.assign(total, {[prop]: stateOrProps[prop]}), {})
}

export function setupNonObservables(component, stateOrProps, setState = true) {

  component._nonObservables = nonObservables(stateOrProps)

  setState && component.setState(component._nonObservables)
}

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param {React.Component} component
 * @param {*} prop
 * @returns {Function} callback
 * @private
 */
const _callback = (component, prop) => val => component.setState({[prop.name]: val})
const _subscribe = (observableList, callbacks) =>
  observableList.forEach((obj, i) => obj.observable.onValue(callbacks[i]))
const _pluck = (obj, keys) =>
  keys.reduce((culledObj, key) => Object.assign(culledObj, {[key]: obj[key]}), {})


function _setupObservableState(component, observableList, initialState) {

  initialState = initialState || component.state || {}

  const callbacks = observableList.map(prop => _callback(component, prop))

  //set default state first before setting up listeners
  component.setState(
    _pluck(initialState, observableList.map(x => x.name)), // set observables only
    () => _subscribe(observableList, callbacks)
  )

  return callbacks
}

export function setupObservables(component, stateOrProps) {

  component._observables = observables(stateOrProps)
  component._callbacks = _setupObservableState(component, component._observables)
}

export function removeObservables(component) {

  const observables = component._observables
  const callbacks = component._callbacks

  observables.forEach((obj, i) => obj.observable.offValue(callbacks[i]))
}
