import Kefir from 'kefir'

import checkUnique from './internal/checkUnique'
import createAppDispatcher from './appdispatcher/createAppDispatcher'
import createChannels from './channels/createChannels'
import createSagas from './channels/createSagas'
import sagaInterfaceFactory from './channels/sagaInterfaceFactory'
import reduxMiddlewareFactory from './redux/reduxMiddlewareFactory'
import createReduxReducers from './redux/createReduxReducers'


/**
 * A channel consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - map of Reducers indexed by ActionType
 * - map of ActionFunctions indexed by ActionType
 *
 * See `createChannels` for more details.
 *
 * A saga consists of:
 * - a name (channel)
 * - map of ActionTypes
 * - SagaHandlersFn higher order function that accepts a `sagas` interface and
 *   returns the SagaHandlers.
 *
 * See `createSagas` for more details.
 *
 * A middleware is function with the following signature:
 * store => next => action
 *
 * @param {Channels[]} channels
 * @param {Sagas[]} sagas
 * @param {Middleware[]} middleware
 * @returns {{AppState, AppDispatcher}} the AppState and its dispatcher to send messages.
 */
export default function appStateFactory(
  {
    channels: rawChannels = [],
    sagas: rawSagas = [],
    redux: {middleware = [], reducers = {}} = {redux: {middleware: [], reducers: {}}}
  }) {

  /* eslint-disable no-use-before-define */
  // setup redux
  const Middleware = reduxMiddlewareFactory({
    AppDispatcher: createAppDispatcher(),
    rawMiddleware: middleware
  })
  const AppDispatcher = Middleware.appDispatcher()

  // setup public interface
  const reduxStore = createReduxReducers({Reducers: reducers, AppDispatcher})
  const channels = createChannels({rawChannels, AppDispatcher})
  const appStateObservable =
    _createAppStateObservable({channels: [...channels, ...reduxStore]})
    // inject the state back into Middleware, so that getState works. Unfortunately,
    // in kefirjs, there is no way to do a side effect w/o activating the stream. So
    // we use `map` for side effects (which is technically an antipattern).
      .map(state => {
        Middleware.setState(state)
        return state
      })
  const sagaInterface = sagaInterfaceFactory({AppDispatcher, appStateObservable})
  const sagas = createSagas({rawSagas, AppDispatcher, sagaInterface})

  checkUnique(
    [...rawChannels, ...rawSagas, ...reducers],
    'channel',
    'Cannot have a channel, saga, or redux reducer with the same name'
  )

  _setupChannelObs({channels: [...channels, ...reduxStore], AppDispatcher})
  _setupSagaObs({sagas})

  const AppState = {
    appStateObservable,
    ..._channelsToState({channels: [...channels, ...reduxStore]}),
    ..._sagasToState({sagas})
  }
  /* eslint-enable */

  return {
    AppState,
    AppDispatcher
  }
}

function _createAppStateObservable({channels}) {
  // first create the new appStateObservable
  const channelStatesWithSideEffectsObservables =
    channels.map(x => x.stateWithSideEffectsObservable)

  // then combine these into the appStateObservable
  return Kefir.combine(
    // this fires when any of the channel state observables change
    channelStatesWithSideEffectsObservables,
    // this combines all the channel states into a single state
    (...observables) => observables.reduce(
      (appStateObservable, state, i) => Object.assign(
        appStateObservable,
        {[`${channels[i].name}`]: state.state}
      ),
      {}
    )
  )
}

function _channelsToState({channels}) {
  return channels.reduce((state, channel) => ({...state, ...channel.store}), {})
}

function _sagasToState({sagas}) {
  // add action functions and result observables to app state
  return sagas.reduce((state, saga) => ({...state, ...saga.actionFunctions, ...saga.resultObservables}), {})
}

function _setupChannelObs({channels, AppDispatcher}) {
  // setup one-way data flow + side effects
  channels.forEach(channel => channel.stateWithSideEffectsObservable.onValue(state =>
    (state.sideEffects || []).forEach(
      sideEffect => setTimeout(() => AppDispatcher.emit(sideEffect), 0)
    )
  ))
}

function _setupSagaObs({sagas}) {
  // setup one-way data flow
  sagas.forEach(_sagas =>
    Object.keys(_sagas.observables).forEach(obs => _sagas.observables[obs].onValue(() => undefined))
  )
}



