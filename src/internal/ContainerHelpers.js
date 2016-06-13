import isObservable from '../internal/isObservable'

/**
 * a callback maps a "val" to the obj property on the Component state
 *
 * @param component
 * @param prop
 * @private
 */
function _callback(component, prop) {

  return val => component.setState({[prop.name]: val})
}

function _subscribe(observableStateList, callbacks) {

  observableStateList.forEach((obj, i) => obj.observable.onValue(callbacks[i]))
}

export function setupObservableState(component, observableStateList, initialState) {

  initialState = initialState || component.state || {}

  const callbacks = observableStateList.map(prop => _callback(component, prop))

  //set default state first before setting up listeners
  component.setState(
    initialState,
    () => _subscribe(observableStateList, callbacks)
  )

  return callbacks
}

export function removeObservableState(observableStateList, callbacks) {

  observableStateList.forEach((obj, i) => obj.observable.offValue(callbacks[i]))
}

export function observableState(state) {

  return Object.keys(state)
      .filter(prop => isObservable(state[prop]))
      .map(prop => ({name: prop, observable: state[prop]})) || []
}

export function nonObservableState(state) {

  return Object.keys(state)
    .filter(prop => !isObservable(state[prop]) && prop !== 'children')
    .reduce((total, prop) => Object.assign(total, {[prop]: state[prop]}), {})
}
