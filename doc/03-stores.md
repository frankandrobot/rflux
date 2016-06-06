## How the heck can stores “hold” state in FRP?
Before we talk about how Stores look like in `functional reactive programming (FRP)`, we need to discuss how Stores can even store/manage state in FRP. Technically speaking, in `functional programming (FP)`, functions are not supposed to store state between successive calls.

There are at least two strategies in FRP:

1.  use `scan` (aka `reduce`).
2.  move state to a global component, say `ApplicationState`.

### Strategy 1: Use the scan Luke
This approach is the most similar to Flux.

Basically, in FP, you get around not being able to store state by *passing around state (aka accumulating state) in function arguments*. For example, the code below shows the `factorial` function, FP style. Note how the function argument `acc` *accumulates* the result of successive function calls.

```javascript
factorial(n, acc=1) {
    if (n >= 1) return acc
    return factorial(n-1, n*acc)
}
```

In FRP, you can store successive stream values using the `scan` function (which works just like `reduce`)

```javascript
//myObservable = 0, 1, 2, 3, ...
const store = myObservable.scan(
    (storedValues, curValue) => storedValues.concat([curValue]), []
)

store.onValue(x => console.log(x))
// [0]
// [0, 1]
// [0, 1, 2]
// [0, 1, 2, 3]
// etc
```

#### Variation 1: The Straightforward Approach
This leads to a straightforward implementation of a store:

```javascript
// TodoStore.js
import AppDispatcher from 'AppDispatcher'
import uuid from 'uuid' //module for generatin' IDs

// pull functionality into functions and export for easy testing
export function createTodo(todos, todo) {

    todo.id = uuid.v4() // easy-peasy way to get an id
    todos[todo.id] = todo
    return todos
}

export function scanner(todos, action) {

    switch(action.actionType) {
        case 'create':
          return createTodo(todos, action.payload)
        default:
          return todos;
    }
}

const todoStore = AppDispatcher
    .filter(x => x.channel === 'todo')
    .scan(scanner, {})

export default todoStore

// SomeOther.js
//create a todo:
AppDispatcher.emit({
  channel: 'todo',
  actionType: 'create',
  payload: 'hello world'
})
```

#### Variation 2: Action Streams
Alternatively, we can create action streams for each action and merge them using the FRP library. For example:

```javascript
// TodoStore.js
import AppDispatcher from 'AppDispatcher'
import uuid from 'uuid'
import Kefir from 'kefir'

const todoActions = AppDispatcher.filter(x => x.channel === 'todo')

// note that we return a higher-order function
export function createTodo(todo) {
    return todos => {
      todo.id = uuid.v4()
      todos[todo.id] = todo
      return todos
  }
}

export function updateTodo(todo) {
    return todos => {
        todos[todo.id] = todo
        return todos
    }
}

export const createActionStream = todoActions
    .filter(x => x.actionType === 'create')
    .map(x => createTodo(x.payload))

export const updateActionStream = todoActions
    .filter(x => x.actionType === 'update')
    .map(x => updateTodo(x.payload))

// the way "merge" works in FRP libraries
// is that it fires each time one of the action
// streams receives an update
const todoStream = Kefir
  .merge([createActionStream, updateActionStream])
  .scan((todos, modificationFunction) => modificationFunction(todos), {})

export default todoStream

// SomeOther.js
import {createActionStream} from 'TodoStore'

//create a todo:
AppDispatcher.emit({
  channel: 'todo',
  actionType: 'create',
  payload: 'hello world'
})

//listen to create action
//note that this won't work. There are other issues
createActionStream.onValue(() => console.log('todo created'))
```

#### The Shootout: The Straightforward Approach vs Action Streams

The `Straightforward Approach` is simple to write and simple to understand.
Not surprisingly, it's easily unit tested (since everything is a function).
The downside is boilerplate---you'll need to create something that looks
like `Action Streams` anyway because you'll need action streams<sup>[1](#actionstreams)</sup>.

Unfortunately, the action streams we defined in `Action Streams`
aren't actually that useful. For example, look at `createTodo`---
how do you get the id of the newly created todo? Call the function it returns?
If you look closely, that'll return a new id each time it's called.
We would need to make the function **idempotent** (i.e., return the same value
each time it's called), and this can be error prone.

```javascript
//idempotent createTodo - this can be used to get the id of the newly created todo
export function createTodo(todo) {
    const id = uuid.v4()
    return todos => {
      todo.id = id
      todos[id] = todo
      return todos
  }
}
```

<a name="actionstreams">1</a>: Action streams tell us when an action occurs
and so are useful for things like showing Toast messages in response to app events.

#### A Note About Observers (aka Subscribers aka Listeners)

The `createActionStream` listener defined in the example above isn't guaranteed to work.
The reason is because the `create` event happens before the listener definition
(so there's nothing to "listen" to. Or, if you use a *Property*, the listener
will get the old value).  

The obvious solution is to define the listener before emitting `create` event...
but that seems weird. Alternatively, we can take advantage of Javascript's async queue---
wrap the emit action in a `setTimeout` with a timeout of 0
(so that it executes as soon as possible but after the current function context).

```javascript
setTimeout(() => AppDispatcher.emit({
  channel: 'todo',
  actionType: 'create',
  payload: 'hello world'
}), 0)

//listen to create action
createActionStream.onValue(() => console.log('todo created'))
```

### Strategy 2: Global State aka Dude, Where are My Stores?

Suppose we store global state in a single place called `AppState`.
It would be a really dumb idea if we put all (unrelated) logic in one place.
Therefore, it still makes sense for Stores to exist.
However, because Stores aren’t allowed to store/hold/accumulate state,
stores become nothing but **pure functions** (containing domain-specific logic).
Essentially, we just stumbled on the [Redux](http://redux.js.org/) architecture.

```javascript
// TodoStore.js aka TodoReducer (in Redux parlance)
import AppDispatcher from 'AppDispatcher'
import uuid from 'uuid' //module for generatin' IDs

// pull functionality into functions and export for easy testing
export function createTodo(todos, todo) {

    todo.id = uuid.v4() // easy-peasy way to get an id
    todos[todo.id] = todo
    return todos
}

export function todos(todos, action) {

    switch(action.actionType) {
        case 'create':
          return createTodo(todos, action.payload)
        default:
          return todos;
    }
}
```

```javascript
// AppState.js
import AppDispatcher from './AppDispatcher'
import TodoStore from './TodoStore'
// assuming UserStore is created similar to TodoStore
import UserStore from './UserStore'

function scanner(state, action) {

    return {
        todos: TodoStore.todos(state.todos, action),
        users: UserStore.users(state.users, action)
    }
}

const appStateStream = AppDispatcher.scan(scanner, {})
const todosStream = appState.map(appState => appState.todos)
const usersStream = appState.map(appState => appState.users)

export default {
    appStateStream,
    todosStream,
    usersStream
}
```

With the exception of AppState, the `Global State Strategy` looks suspiciously
similar to the `Straightforward Approach`... and that's the problem.
You have more boilerplate than is necessary because in FRP, you get AppState for free.
