import Kefir from 'kefir'


/**
  * A pool makes an amazing bus. It has one flat (bug),
  * it's first event is undefined.
  */
export default function kefirEmitter() {

  const emitter = Kefir.pool()
  const skipFirst = emitter.skip(1)

  skipFirst.emit = message => emitter.plug(Kefir.constant(message))

  return skipFirst
}
