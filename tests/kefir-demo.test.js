/* eslint func-names: 0*/
/**
 * This doesn't really test kefir. It's to document edge-case behavior.
 */
import test from 'tape'

import kefir from 'kefir'


test('scan outputs once', function(t) {
  t.plan(1)
  kefir.constant(1)
    .scan((total, i) => t.equal(i, 1), 0)
    .onValue(() => undefined)
})

test('combine scan outputs XXX', function(t) {
  t.plan(3)
  let ctr = 0
  // both start at the same time but the first one is faster
  const obs1 = kefir.sequentially(50, [0, 1]).delay(50)
  const obs2 = kefir.sequentially(100, [2, 3])

  kefir.combine([obs1, obs2], (a, b) => {
    switch(++ctr) {
      case 1:
        t.deepEqual({a, b}, {a: 0, b: 2})
        break
      case 2:
        t.deepEqual({a, b}, {a: 1, b: 2})
        break
      case 3:
        t.deepEqual({a, b}, {a: 1, b: 3})
        break
      default:
        // will actually throw an error if called (since the plan is only for 3 calls
        t.equal(1, 1)
    }
  }).onValue(() => undefined)
})

const obs1 = kefir.sequentially(50, [0, 1]).delay(50)
const obs2 = kefir.sequentially(100, [2, 3])
