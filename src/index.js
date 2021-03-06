import createContainer from './components/createContainer'
import createDangerouslySlowContainer from './components/createDangerouslySlowContainer'
import Container from './components/Container'

import StateWithSideEffects from './channels/StateWithSideEffects'
import {state} from './channels/StateWithSideEffects'
import sagaFactory from './channels/sagaInterfaceFactory'

import kefirEmitter from './utils/kefirEmitter'

import appStateFactory from './appStateFactory'


export {
  createContainer,
  createDangerouslySlowContainer,
  Container,
  state,
  StateWithSideEffects,
  kefirEmitter
}

export default appStateFactory
