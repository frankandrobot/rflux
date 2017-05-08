import kefir from 'kefir'


export default function middlewareFactory({dispatch, rawMiddleware}) {

  let state = null
  const store = {
    dispatch,
    getState: () => state
  }
  const middleware = rawMiddleware.map(__middleware => __middleware(store))

  return {
    setState: _state => state = _state,

    attachMiddleware({AppDispatcher}) {
      const AppDispatcherObs =
        // this injects the middleware into the AppDispatcher. Middleware can stop propagation of events
        // to observables by not calling "next(action)". Middleware can also transform actions or dispatch
        // their own actions.
        AppDispatcher
        .flatMap(action =>
          middleware.reduce(
            (chain, _middleware) => {
              let transformedAction = action
              let allowContinue = false
              // the "next" action doesn't actually do anything.... it just tells the chain of
              // filters to continue. Also allows the middleware to transfom the action
              const next = _action => {
                transformedAction = _action
                allowContinue = true
              }

              return chain
                .filter(_action => {
                  _middleware(next)(_action)
                  // stop if next not called
                  return allowContinue
                })
                // transform action (if requested)
                .map(() => transformedAction)
            },
            kefir.constant(action)
          )
        )

      // Yuck. Turn the observer into a dispatcher by adding an emit method that dispatches events into
      // the *original* AppDispatcher bus. Recall that the AppDispatcher is a bus (an observable with an emit
      // method).
      Object.assign(AppDispatcherObs, {emit: (...args) => AppDispatcher.emit(...args)})

      return AppDispatcherObs
    }
  }
}
