import kefirEmitter from './support/kefirEmitter'


/**
 * This is the global AppDispatcher.
 * Every action must go through the AppDispatcher.
 *
 * Returns a Kefir.pool() that we use a bus.
 *
 **/
export default kefirEmitter()
