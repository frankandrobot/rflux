import createDangerouslySlowContainer from './createDangerouslySlowContainer'


/**
 * Doesn't support parent React props.
 * However, you can define complex state functions.
 *
 * Do NOT use anonymous functions to define getInitialState, getObservableState, getDefaultProps!
 *
 * @param {Function} opts.getDefaultProps - container default props. Passed to child as
 * props.
 * @param {Function} opts.getInitialState - container initial state. Passed to child as
 * props.
 * @param {Function} opts.getObservableState - pass observables here. Observable *values*
 * passed to child as props
 * @param {*} opts.propTypes - container propTypes.
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
