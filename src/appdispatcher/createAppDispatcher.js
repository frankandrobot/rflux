import kefirEmitter from '../utils/kefirEmitter'


/**
 * This is the global AppDispatcher.
 * Every action must go through the AppDispatcher.
 *
 * Returns a Kefir.pool() that we use a bus.
 * @returns {Kefir.pool}
 **/
export default function createAppDispatcher() {
  return kefirEmitter()
}
