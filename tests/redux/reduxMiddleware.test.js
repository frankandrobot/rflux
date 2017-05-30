import test from 'tape'

import createAppDispatcher from '../../src/appdispatcher/createAppDispatcher'
import middlewareFactory from '../../src/redux/reduxMiddlewareFactory'


const objectUnderTestFn = () => {
  const stopOnOdd = () => next => action => {
    if (action % 2 === 0) {
      return next(action)
    }
    return null
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
  const mw = middlewareFactory({AppDispatcher, rawMiddleware: middleware})
  const result = mw.appDispatcher()

  result
    .onValue(x => t.equal(x.payload, 0))
    .onValue(() => t.end())
    .onError(() => t.fail())

  AppDispatcher.emit({payload: 0})
})


test('middleware should have a working dispatch', function(t) {
  const {AppDispatcher, middleware} = objectUnderTestFn()
  const mw = middlewareFactory({AppDispatcher, rawMiddleware: middleware})
  const result = mw.appDispatcher()

  result
    .onValue(x => t.equal(x.payload, 4))
    .onValue(() => t.end())
    .onError(() => t.fail())

  AppDispatcher.emit({payload: 2})
})


test('middleware should stop if next is not called', function(t) {
  const {AppDispatcher, middleware} = objectUnderTestFn()
  const mw = middlewareFactory({AppDispatcher, rawMiddleware: middleware})
  const result = mw.appDispatcher()

  result
    .onValue(() => t.equal(0, 1))
    .onError(() => t.fail())

  AppDispatcher.emit({payload: 1})
  t.end()
})
