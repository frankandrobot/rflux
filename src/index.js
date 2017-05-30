import createContainer from './components/createContainer'
import createDangerouslySlowContainer from './components/createDangerouslySlowContainer'
import DangerouslySlowContainer from './components/DangerouslySlowContainer'

import StateWithSideEffects from './channels/StateWithSideEffects'
import {state} from './channels/StateWithSideEffects'
import sagaFactory from './channels/sagaInterfaceFactory'

import appStateFactory from './appStateFactory'


export {
  createContainer,
  createDangerouslySlowContainer,
  DangerouslySlowContainer,
  state,
  StateWithSideEffects
}

export default appStateFactory
