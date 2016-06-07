import Kefir from 'kefirjs'


export default function kefirEmitter() {

  const emitter = Kefir.pool()

  emitter.emit = message => emitter.plug(Kefir.constant(message))

  return emitter
}

