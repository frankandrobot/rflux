import kefir from 'kefir'

import assert from '../internal/assert'


/**
 * This is the hardcoded channel name for redux
 * @type {String}
 */
const reduxChannelName = 'redux'

/**
 * This injects the middleware into the AppDispatcher. Middleware can stop propagation
 * of events to observables by not calling "next(action)". Middleware can also
 * transform actions or dispatch their own actions.
 * @param {kefirEmitter} AppDispatcher
 * @param {middleware[]} rawMiddleware
 * @returns {*}
 */
export default function reduxMiddlewareFactory({AppDispatcher, rawMiddleware}) {

  assert(AppDispatcher, 'Need an AppDispatcher')
  assert(rawMiddleware, 'Need rawMiddleware')

  let state = null
  const reduxStore = {
    // transform redux-formatted message to rflux
    dispatch: args => AppDispatcher.emit({
      channel: reduxChannelName,
      actionType: (args || {}).type,
      payload: args
    }),
    getState: () => state
  }
  const middleware = rawMiddleware.map(__middleware => __middleware(reduxStore))

  return {
    setState: _state => state = _state,

    /**
     * This AppDispatcher is middleware aware.
     * @returns {kefirEmitter} the AppDispatcher
     **/
    appDispatcher() {
      const AppDispatcherObs =
        AppDispatcher
          .flatMap(rfluxAction =>
            middleware
              .reduce(
                (chain, _middleware) => {
                  let transformedReduxAction
                  let allowContinue = false
                  // the "next" action doesn't actually do anything.... it just tells the
                  // chain of filters to continue. Also allows the middleware to transfom
                  // the payload
                  const next = reduxAction => {
                    transformedReduxAction = reduxAction
                    allowContinue = true
                  }

                  return chain
                    .filter(reduxAction => {
                      _middleware(next)(reduxAction)
                      // stop if next not called
                      return allowContinue
                    })
                    // transform action (if requested)
                    .map(() => transformedReduxAction)
                },
                kefir.constant(rfluxAction.payload)
              )
              .map(reduxAction => ({...rfluxAction, payload: reduxAction}))
          )

      // Yuck. Turn the observer into a dispatcher by adding an emit method that
      // dispatches events into the *original* AppDispatcher bus. Recall that the
      // AppDispatcher is a bus (an observable with an emit method).
      Object.assign(AppDispatcherObs, {emit: (...args) => AppDispatcher.emit(...args)})

      return AppDispatcherObs
    }
  }
}
