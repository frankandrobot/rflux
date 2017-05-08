import createContainer from './components/createContainer'
import createDangerouslySlowContainer from './components/createDangerouslySlowContainer'
import DangerouslySlowContainer from './components/DangerouslySlowContainer'

import StateWithSideEffects from './stores/StateWithSideEffects'
import {state} from './stores/StateWithSideEffects'
import sagaFactory from './stores/sagaFactory'

import appStateFactory from './appStateFactory'


export {
  createContainer,
  createDangerouslySlowContainer,
  DangerouslySlowContainer,
  state,
  StateWithSideEffects,
  sagaFactory
}

export default appStateFactory
