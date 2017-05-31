# rflux

ReactJS Flux/Redux reimagined using Functional Reactive Programming with KefirJS + epics.

## Installation

With npm:

```bash
npm install --save react-rflux
```

or with jspm:

```bash
jspm install npm:react-rflux
```
 
## Why rflux?

-  Lightweight at less than 30k. With [KefirJS](https://rpominov.github.io/kefir/), it's 
   still less than 40k!
-  Code components in a manner similar to [redux](http://redux.js.org). The power of 
   [functional reactive programming](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) 
   as needed. [Epics](https://redux-observable.js.org/docs/basics/Epics.html) 
   baked right in.
-  Redux compatible. Use redux reducers and middleware. `redux-dev-tools` compatibility 
   is in the works!

## Why Epics?

*Epics* can be thought of as observable-based [sagas]
(https://github.com/redux-saga/redux-saga). (If you don't know what sagas are, think of
these as a way to handle async workflows.) The main advantage to epics is that 
observables are [s32tandards based](https://github.com/tc39/proposal-observable). Both 
describe a language on top of Javascript. However, I strongly suspect that functional 
reactive programming with observables is *more powerful* than sagas. 

Oh and by the way, *functional reactive programming* (or FRP) is just programming with 
*asynchronous* data streams. Think `map`/`reduce` but with an asynchronous data source 
instead of arrays. 

## Usage Example

Build a channel.

```javascript
// counter.actiontypes.js
export default {
  increment: 'increment',
  decrement: 'decrement',
}
// counter.actions.js
export default {
  increment: x => ({channel: 'counter', actionType: 'increment', payload: x}),
  decrement: x => ({channel: 'counter', actionType: 'decrement', payload: x})
}
// counter.reducers.js
export default {
  initialState: 0,
  increment(state, action) {
     const {payload} = action
     return state + payload
  },
  decrement(state, action) {
    const {payload} = action
    return state - payload
  }
}
// counter.channel.js
import ActionTypes from './counter.actiontypes'
import Reducers from './counter.reducers'
import ActionFunctions from './counter.actions'

export default {
  channel: 'counter',
  ActionTypes,
  Reducers,
  ActionFunctions
}
```

Build the app state 

```javascript
// appstate.js
import appStateFactory from 'react-rflux'

const {AppState} = appStateFactory({
  channels: [CounterChannel]
})

Hook up the component

```jsx
import {Container} from 'react-rflux'
import {AppState} from './appstate'

const Counter = ({value, inc, dec}) => 
  <div>
     <div>Value: {value}</div>
     <button onClick={inc}>increase</button>
     <button onClick={dec}>decrease</button>
  </div>

const CounterContainer = () => {
  return (
    <Container
       value={AppState.observables.counter}
       inc={() => AppState.actions.increment(1)}
       dec={() => AppState.actions.decrement(2)}
    >
      <Counter/>
    </Container>
  )
}
```

## More Complex "Hello World" Example

Sample usage, for now, can be found at: https://github.com/awesome-editor/awesome-editor/

## Documentation

Checkout the [docs](./doc/).

