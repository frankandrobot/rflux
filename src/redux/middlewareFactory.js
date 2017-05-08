import kefir from 'kefir'


export default function middlewareFactory({dispatch, rawMiddleware}) {

  const store = {
    dispatch,
    getState: () => undefined
  }
  const middleware = rawMiddleware.map(__middleware => __middleware(store))

  return {
    setState: () => undefined,
    spyOnAppDispatcher({AppDispatcher}) {
      return AppDispatcher
        // this turns the middlewares into a stream of filters
        .flatMap(action =>
          middleware.reduce(
            (chain, _middleware) => {
              let transformedAction = action
              let allowContinue = false
              // the "next" action doesn't actually do anything.... it just tells the chain of
              // filters to continue. But also allows the middleware to transfom the action
              const next = _action => {
                transformedAction = _action
                allowContinue = true
              }

              return chain
                .filter(_action => {
                  _middleware(next)(_action)
                  return allowContinue
                })
                .map(() => transformedAction)
            },
            kefir.constant(action)
          )
        )
    }
  }
}
