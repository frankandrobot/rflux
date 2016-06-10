import Kefir from 'kefir'


export default function kefirEmitter() {

  const emitter = Kefir.pool()

  return Object.assign(emitter, {emit: message => emitter.plug(Kefir.constant(message))})
}
