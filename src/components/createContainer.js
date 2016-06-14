import createDangerouslySlowContainer from './createDangeourslySlowContainer'


/**
 * Doesn't support parent React props.
 * However, you can define complex state functions.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Function} getDefaultProps - container default props. Passed to child as props.
 * @param {Function} getInitialState - container initial state. Passed to child as props.
 * @param {Function} getObservableState - pass observables here. Observable *values* passed to child as props
 * @param {*} propTypes - container propTypes.
 * @returns {Function} that receives the child view
 */
export default function createContainer({
  getDefaultProps = () => ({}),
  getInitialState = () => ({}),
  getObservableState = () => ({}),
  propTypes = {}}) {

  return createDangerouslySlowContainer({
    getDefaultProps,
    getInitialState,
    getObservableState,
    propTypes,
    __dangerouslyEnableSlowness: false
  })
}
