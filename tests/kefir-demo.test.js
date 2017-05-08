/* eslint func-names: 0*/
/**
 * This doesn't really test kefir. It's to document edge-case behavior.
 */
import test from 'tape'

import kefir from 'kefir'

import kefirEmitter from '../src/utils/kefirEmitter'


test('kefir#scan fires extra event for initialValue', function(t) {
  t.plan(3)

  let ctr = 0
  const sequence = kefir.sequentially(50, [1, 2])

  sequence.scan((_, i) => i, 0)
    .onValue(x => {
      switch(ctr++) {
        case 0:
          t.equal(x, 0) // initial value
          break
        case 1:
          t.equal(x, 1)
          break
        case 2:
          t.equal(x, 2)
          break
        default:
          t.equal(0, 1) //should never be called
      }
    })
})


test('kefir#pool + kefir#scan autofires event for initialValue', function(t) {
  t.plan(1)

  let ctr = 0
  const emitter = kefirEmitter()
  const evenScan = emitter
    .filter(x => x % 2 === 0)
    .scan((_, x) => x, 0)

  evenScan
    .onValue(x => {
      switch(ctr++) {
        case 0:
          t.equal(x, 0) // initial value
          break
        default:
          t.equal(0, 1) //should never be called
      }
    })
})

test('kefir#pool + kefir#scan should work', function(t) {
  t.plan(2)

  let ctr = 0
  const emitter = kefirEmitter()
  const evenScan = emitter
    .filter(x => x % 2 === 0)
    .scan((_, x) => x, 0)

  evenScan
    .onValue(x => {
      switch(ctr++) {
        case 0:
          t.equal(x, 0) // initial value
          break
        case 1:
          t.equal(x, 2)
          break
        default:
          t.equal(0, 1) //should never be called
      }
    })

  emitter.emit(1)
  emitter.emit(2)
})


test('kefir#pool + kefir#combined fires when all observables have values', function(t) {
  t.plan(1)

  const emitter = kefirEmitter()
  const even = emitter.filter(x => x % 2 === 0)
  const odd = emitter.filter(x => x % 2 === 1)
  const observables = [even, odd]
  const names = ['even', 'odd']

  kefir.combine(
    observables,
    (...observables) => observables.reduce(
      (combinedState, x, i) => Object.assign(
        combinedState,
        {[names[i]]: x}
      ),
      {}
    )
  ).onValue(state => {
    t.deepEqual(state, {odd: 1, even: 0})
  })

  emitter.emit(0)
  emitter.emit(1)
})


test('kefir#pool + kefir#combined + kefir#scan autofires initial state', function(t) {
  t.plan(1)

  let ctr = 0
  const emitter = kefirEmitter()
  const evenScan = emitter.filter(x => x % 2 === 0).scan((_, x) => x, 0)
  const oddScan = emitter.filter(x => x % 2 === 1).scan((_, x) => x, 1)
  const observables = [evenScan, oddScan]
  const names = ['even', 'odd']

  kefir.combine(
    observables,
    (...observables) => observables.reduce(
      (combinedState, x, i) => Object.assign(
        combinedState,
        {[names[i]]: x}
      ),
      {}
    )
  ).onValue(state => {
    switch(ctr++) {
      case 0:
        t.deepEqual(state, {even: 0, odd: 1})
        break
      default:
        t.equal(0, 1) // should not fire
    }
  })
})


test('kefir#pool + kefir#combined + kefir#scan should work', function(t) {
  t.plan(2)

  let ctr = 0
  const emitter = kefirEmitter()
  const evenScan = emitter.filter(x => x % 2 === 0).scan((_, x) => x, 0)
  const oddScan = emitter.filter(x => x % 2 === 1).scan((_, x) => x, 1)
  const observables = [evenScan, oddScan]
  const names = ['even', 'odd']

  kefir.combine(
    observables,
    (...observables) => observables.reduce(
      (combinedState, x, i) => Object.assign(
        combinedState,
        {[names[i]]: x}
      ),
      {}
    )
  ).onValue(state => {
    switch(ctr++) {
      case 0:
        t.deepEqual(state, {even: 0, odd: 1})
        break
      case 1:
        t.deepEqual(state, {even: 0, odd: 3})
        break
      default:
        t.equal(0, 1)
    }
  })

  emitter.emit(3)
})


test('transform an array into chained streams', function(t) {
  const arr = [1, 2, 3]

  arr
    .reduce((chain, x) => chain.map(y => y + x), kefir.constant(0))
    .onValue(result => t.deepEqual(result, 0+1+2+3))
    .onValue(() => t.end())
    .onError(() => t.fail())
})

