# State in FRP?
In a pure functional language, there is no state. So how the heck can we get anything done?

There are at least two strategies in FRP:

1.  use an "accumulator" variable to pass store around in function arguments
2.  use a global component, say `ApplicationState`.

## Strategy 1: Use the Scan Luke
This approach turns out to be the most similar to
[Flux](https://facebook.github.io/flux/docs/overview.html).

Basically, in FP, you get around not being able to store state by
*passing around state (aka accumulating state) in function arguments*.
For example, the code below shows the `factorial` function, FP style.
The function argument `acc` *accumulates* the result of successive function calls.

```javascript
factorial(n, acc=1) {
  if (n >= 1) return acc
  return factorial(n-1, n*acc)
}
```

We are already saw this technique in [reduce and scan](./01-fp-overview.md#frp) where we "stored state" inside `scan`'s accumulator variable.
In ReactJS terminology, a **store** can be thought of as a model + controller (well, sort of).
An *FRP store* is just a scan function that stores state in its accumulator variable.

For example:

```javascript
//myObservable = 0, 1, 2, 3, ...
const store = myObservable.scan((values, cur) => values.concat([cur]), [])

store.onValue(x => console.log(x))
// [0]
// [0, 1]
// [0, 1, 2]
// [0, 1, 2, 3]
// etc
```

We just need a way to pass messages to *myObservable*.
In FRP, we can use a *bus*.
A **bus** is a special stream that can receive messages.

In BaconJS, creating a bus is a simple as:

```javascript
const myObservable = new Bacon.Bus()
```

Messages can be anything. In the example above:

```javascript
myObservable.push(0)
myObservable.push(1)
//...
```

Note: *push* values to the bus, not the stream. In the example above,
`store.push(0)` throws an error because it is a stream, not a bus.

### Variation 1: The Straightforward Approach

A straightforward implementation of a "todo" store is:

```javascript
// TodoStore.js
import AppDispatcher from '...' //the bus

export function updateTodo(todos, todo) {

  todos[todo.id] = todo //replace existing todo with latest
  return todos
}

export function todoStore(todos, action) {

  switch(action.type) {
    case 'update':
      return updateTodo(todos, action.payload)
    default:
      return todos;
  }
}

const todoStoreStream = AppDispatcher.scan(scanner, {})

export default todoStoreStream
```

An update action looks like this:

```javascript
AppDispatcher.push({
  type: 'update',
  payload: {id: 1, content: 'hello world'}
})
```

Note: the architecture shown above is *almost* a version of flux called
[Redux](https://github.com/reactjs/redux).
The difference between this strategy and Redux is that the latter uses a global
store, whereas this solution uses many stores.
The point is that Flux and Redux both follow from FRP principles.

In Redux terminology, the store-state functions (in this case, `updateTodo`)
are called **reducers**.

### <a name="actionstreams">Variation 2: Action Streams</a>

We define **action streams** to be streams that fire whenever an action occurs.
Action streams are useful in a real-world app because they can be used
for things like showing Toast messages in response to app events.

Another variation of the TodoStore is to define it in terms of action streams.
For example:

```javascript
// TodoStore.js
import AppDispatcher from '...'
import Kefir from 'kefir'

// note that we return a higher-order function
export function updateTodo(todo) {
  return todos => {
    todos[todo.id] = todo
    return todos
  }
}

export function createTodo(todo) {
  return todos => {
    todo.id = //create an id
    todos[todo.id] = todo
    return todos
  }
}

// This stream fires whenever an update action occurs.
export const updateActionStream = AppDispatcher
  // filter works just like Array.filter.
  // It fires only when the message is of type === 'update'
  .filter(x => x.type === 'update')
  .map(x => updateTodo(x.payload))

// This stream fires whenever a create action occurs.
export const createActionStream = AppDispatcher
  .filter(x => x.type === 'create')
  .map(x => createTodo(x.payload))

// In FRP libraries, "merge" fires anytime either stream fires
// So when an update action happens, the merge fires,
// returning the update function.
// When a create action happens, the merge fires,
// returning the create function
const todoStoreStream = Kefir
  .merge([createActionStream, updateActionStream])
  .scan((todos, actionFunction) => actionFunction(todos), {})

export default todoStoreStream
```

Actions work as before:

```javascript
AppDispatcher.push({
  type: 'create',
  payload: {content: 'hello world'}
})

//But we can now listen to create actions...or at least that's the idea.
//(See below for details.)
createActionStream.onValue(() => console.log('todo created'))
```

### The Shootout: The Straightforward Approach vs Action Streams

The `Straightforward Approach` is simple to write and simple to understand.
Not surprisingly, it's easily unit tested (since everything is a function).
The downside is boilerplate---you'll need to create something that looks
like `Action Streams` anyway.

The main problem with `Action Streams` is that the action streams aren't actually
that useful. Yes, they fire whenever an action happens but getting detailed
information is hard. For example, look at `createTodo`---
how do you get the id of the newly created todo? Call the function it returns?
If you look closely, that'll return a new id each time it's called.
We would need to make the function **idempotent** (i.e., return the same value
each time it's called), and this can be error prone.

```javascript
//idempotent createTodo - this can be used to get the id of the newly created todo
export function createTodo(todo) {
    const id = //create id
    return todos => {
      todo.id = id
      todos[id] = todo
      return todos
  }
}
```

**Winner:** The Straightforward Approach

### <a name="#antipattern">A Note About Observers (aka Buses are an Anti-Pattern)</a>

The `createActionStream` listener defined in the example won't work.
The reason is because the `create` event happens before the listener definition,
so there's nothing to listen to. (Or, if you use a *Property*, the listener
will get the old value). This is often cited as a reason
[why buses are bad](https://github.com/rpominov/kefir/issues/88).

We will examine this issue in [the next article](03-dispatcher.md).

## Strategy 2: Global State aka Dude, Where are My Stores?

Suppose we store global state in a single place called `AppState`.
It would be really dumb if we put all (unrelated) logic in one place.
Therefore, it still makes sense for stores to exist.
However, because stores aren’t allowed to store/hold/accumulate state,
stores become nothing but *pure functions* (containing domain-specific logic).
Essentially, we just stumbled on the full
[Redux](http://redux.js.org/) architecture.

```javascript
// TodoStore.js aka TodoReducer (in Redux parlance)
import AppDispatcher from '...'

export function createTodo(todos, todo) {
  todo.id = //create an id
  todos[todo.id] = todo
  return todos
}

export function todos(todos, action) {
  switch(action.type) {
    case 'create':
      return createTodo(todos, action.payload)
    default:
      return todos;
  }
}
```

```javascript
// AppState.js
import AppDispatcher from '...'
import TodoStore from './TodoStore'
// assuming UserStore is similar to TodoStore...
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

## Shootout: The Straightforward Approach vs Global State Strategy

The `Global State Strategy` is the `Straightforward Approach` with all the
scan functions centralized in one location. Yes, it's not too hard to write
a helper function to register the scan functions for us and create AppState.
However, it is still code we need to write. In contrast,
the `Straightforward Approach` works out of the box using the FRP library.

The `Global State Strategy` shines when it comes time for *time travel*.
The reason is because AppState *stores the entire app state*.
To get the same functionality in the `Straightforward Approach`,
we would need to write a helper function to register all stores and combine them
into a single stream. The jury is still out on which helper function is simpler.

**Winner:** Tie for now. (Although I suspect that combining the store streams
in the `Straightforward Approach` is relatively easy to do)
