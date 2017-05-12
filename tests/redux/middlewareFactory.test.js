import test from 'tape'

import createAppDispatcher from '../../src/appdispatcher/createAppDispatcher'
import middlewareFactory from '../../src/redux/reduxMiddlewareFactory'


const objectUnderTestFn = () => {
  const stopOnOdd = () => next => action => {
    if (action % 2 === 0) {
      return next(action)
    }
  }
  const redispatchSecond = store => next => action => {
    if (action === 2) {
      return Promise.resolve(4).then(store.dispatch)
    }
    return next(action)
  }
  const passThrough = () => next => action => next(action)

  return {
    AppDispatcher: createAppDispatcher(),
    middleware: [stopOnOdd, redispatchSecond, passThrough]
  }
}


test('middleware should pass message thru all', function(t) {
  const {AppDispatcher, middleware} = objectUnderTestFn()
  const dispatch = (...args) => AppDispatcher.emit(...args)
  const mw = middlewareFactory({dispatch, rawMiddleware: middleware})
  const result = mw.attachMiddleware({AppDispatcher})

  result
    .onValue(x => t.equal(x, 0))
    .onValue(() => t.end())
    .onError(() => t.fail())

  AppDispatcher.emit(0)
})


test('middleware should have a working dispatch', function(t) {
  const {AppDispatcher, middleware} = objectUnderTestFn()
  const dispatch = (...args) => AppDispatcher.emit(...args)
  const mw = middlewareFactory({dispatch, rawMiddleware: middleware})
  const result = mw.attachMiddleware({AppDispatcher})

  result
    .onValue(x => t.equal(x, 4))
    .onValue(() => t.end())
    .onError(() => t.fail())

  AppDispatcher.emit(2)
})


test('middleware should stop if next is not called', function(t) {
  const {AppDispatcher, middleware} = objectUnderTestFn()
  const dispatch = (...args) => AppDispatcher.emit(...args)
  const mw = middlewareFactory({dispatch, rawMiddleware: middleware})
  const result = mw.attachMiddleware({AppDispatcher})

  result
    .onValue(() => t.equal(0, 1))
    .onError(() => t.fail())

  AppDispatcher.emit(1)
  t.end()
})
