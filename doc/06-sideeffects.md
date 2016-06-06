# Actions, Controllers, and Side Effects, Oh my!

We've shown how to create simple [stores](./02-stores.md) and
[initiate actions](./04-action-functions.md).
But we haven't yet talked about how to actually do *side effects*.

For the rest of this article, let's assume we have a simple workflow:

1. save (persist) the todo in the database as the user types in an input box.
2. update the todo in the store *when the database call completes*.
3. update the latest value of the todo in the React component
   *when the store update finishes*.

In other words, the example workflow emphasizes *consistency*---it displays the todo in the View
only after it's been saved in the database. (I'm not saying this is how you should code apps.
In fact, in a customer-facing app, you probably *don't* care about consistency.)

If you're pressed for time, jump ahead to the recommended solution, [FRP Sagas](#saga).
A correct but more complex alternative is [FRP with Action Streams](#actionstreams)

## Approach 1: The Naive

If you're new to both ReactJS and FRP, you probably want to write imperative code:

```javascript
onChange(todo) {
  persist(todo) // ajax call
  updateTodo(todo) // action function
  this.setState({todo}) //update ReactJS component state
}

render() {
  return <input onChange={this.onChange} value={this.state.todo}></input>
}
```

Unfortunately, there's no guarantee any of these events actually happen
in the order they're called---`persist` is an AJAX call and `updateTodo`
just pushes a message to the AppDispatcher (the system is free to do the action
whenever it wants to).

So let's streamify this approach:

```javascript
onChange(todo) {
  persist(todo)
    .flatMap(() => updateTodo(todo)) //flatMap is like map but for streams
    .onValue(() => this.setState({todo}))
}
```

It *is* possible to make `updateTodo` and `persist` return
*streams that fire when each action completes*. Unfortunately,
this approach has one major flaw---you lose data.

The store updates when the database call completes,
so if the database calls complete out of order, the store saves the
wrong (old) data.

The [marble](http://rxmarbles.com/)-like diagram shows what happens
when the user types "a" followed by "b". The todo first has value `a`,
then has value `ab`. The database calls go out and if the call to save "a"
takes longer than the call to save "ab", the stores briefly saves "ab".
The last value saved is "a".

```
Edge case:
      persist: ----------ab--a----->
persistResult: ----a--ab----------->
       update: ----a--ab----------->
```

The problem is that each user input creates a new stream and it is difficult
to coordinate these streams.

But wait, there's more!

Observer callbacks don't unregister themselves unless you explicitly unregister them
or the stream ends. In other words, as the user types, you grow a collection of
callback functions i.e., a memory leak.

Fortunately, it is easy to unregister functions but it is just as equally easy
to forget to do so. That makes this approach dangerous.

## Approach 2: The Bus

Another approach is to use a bus to coordinate user input.

```javascript
onChange(todo) {
  this.bus.push(todo)
}

componentWillMount() {
  this.bus = new Bacon.Bus()
  this.bus
    .flatMapConcat(todo => persist(todo)) // flatMapConcat ensures events fire in correct order
    .flatMap(todo => updateTodo(todo))
    .onValue(todo => this.setState({todo}))
}
```

Again, we're assuming that `updateTodo` and `persist` return streams that fire
when each action completes. Also, for simplicity, we're assuming the streams
return the todo.

The one nice thing with this approach is that it shows how easy it is to deal with
async events in FRP---we are able to deal with a complex edge case with a built-in
feature!

Unfortunately, we still have a memory leak.
When the React component removes itself from the DOM, the observer callback is
still active (and it *will* fire if it ever happens to receive an event,
actually breaking React).

Also, the "controller logic" is in the view. Loose coupling in FRP (or in PubSub really)
can be problematic. The reason isn't hard to see---if you don't know what a stream's
observers are, then it's hard to refactor. And as the app grows, it becomes harder
and harder to reason about the app.

Ideally, we should be writing code like this:

```javascript
//TodoStore.js
function updateTodo(todos, todo) {
  return {...todos, [todo.id]: todo}
  // call persist?
}
```

Can we move the side effects to the store?

## Approach 3: Store with Built-in Side Effects

If we move the side effects to the store, the reducer becomes:

```javascript
//TodoStore.js
function updateTodo(todos, todo) {
  //now returns a stream
  return persist(todo).map(() => ({...todos, [todo.id]: todo}))
}
```

Recall, however, that the reducer functions run inside a scan function.
So we need to rewrite the scan function to work with streams.

```javascript
function todo(todos, action) {
  if (action.type === 'update') {
    return updateTodo(todos, action.payload)
  }
  return Kefir.constant(todos) // convert to stream
}

// scan now returns streams.
// we can use `flatMap` to extract values from the streams...in this case,
// the updated todo list
const todoStoreStream =
  AppDispatcher.scan(todo, null)
    .skip(1) // skip the "null" value
    .flatMapConcat(x => x)
```

This approach is not only clunky but because of `flatMapConcat`,
`todoStoreStream` is only as fast as the `persist` database calls. That means
updates to views are slow---the app won't seem responsive.
(This is actually more of a problem with the *consistency* requirement, than with FRP.)

The real problem is that you still lose data! Notice that when two back-to-back updates come in,
both have the same context. That means the second database call (that completes)
overrides the previous result.

What's going on is similar to when two threads (or processes or web services) try to update
a counter *without a lock*. If the update happens at the same time, usually the last one wins---
the counter isn't incremented by 2; instead it's incremented to the value
of the last call to complete.

One solution is to return a function (i.e., a *calculation*) that updates the counter by one.
This way an intermediary data structure can coordinate the updates without a lock.
(All it knows is that it needs to update the counter twice.)

We can do the same thing---we can return a calculation to update the todos
(or a *promise to update the todos*).

## <a name="actionstreams">Approach 4: FRP with a Dash of Action Streams</a>

```javascript
function updateTodo(todo) {
  //the persist call resolves to a function that updates the todos
  return persist(todo).map(() => todos => ({...todos, [todo.id]: todo}))
}

const updateActionStream = AppDispatcher
  .filter(x => x.type === 'update')
  .flatMapConcat(x => updateTodo(x.payload))

const functionStream =
  Kefir.merge([updateActionStream])
    .scan((todos, modifierFunction) => modifierFunction(todos), {})
```

Hey, we're back to the [action stream approach](./02-stores.md#actionstreams).
As before the problem with this approach is that writing the reducers can be tricky.
Also, this approach is not easy to unit test.

## <a name="saga">Approach 5: The Saga Continues</a>

For illustrative purposes, let's change the requirements to prefer *availability* i.e.,
we want the store and the View to update regardless of whether or not the database
call completes.

Redux has an awesome little library called [redux-saga](https://github.com/yelouafi/redux-saga) for doing side effects using
[generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).
Think of generators as streams using a pull model (instead of a push model) i.e.,
you can stop/restart a generator "stream" at will. This allows `redux-saga`
to solve the unit-test problem while being simple to understand.
Unfortunately, handling async events gets hairy... but that's what FRP is designed for.
Can we write `redux-saga` using streams?

The idea is that just like action functions return "promises" to do actions
(i.e., message objects), we can rewrite the reducers to return a promise
to do a side effect, say to save to the database. The side effects system can work
exactly the same way---return "promises" to interact with the app and do side effects.
A SideEffectsBus can do all the real work.

The reducer becomes:

```javascript
function updateTodo(todos, todo) {
  return {
    todos: {...todos, [todo.id]: todo})),
    sideEffects: [{type: 'persist', payload: todo}]
  }
}
```

We update the scanner to handle the new return signature:

```javascript
function todo(todos, action) {
  if (action.type === 'update') {
    return updateTodo(todos, action.payload)
  }
  return {todos, sideEffects: []}
}

const todoStoreStream = AppDispatcher.scan(todo, {})
```

We now setup an observer to send the side effect messages through the Dispatcher
where a side effect listener can handle the message.

```javascript
//TodoStore.js
todoStream.map(x => x.sideEffects).onValue(sideEffects => {
  sideEffects.forEach(sideEffect => AppDispatcher.push(sideEffect))
})

//Persist.js
listen('persist')
  .map(() => put({type: 'SAVING_TO_DATABASE'}))
  .flatMap(todo => call(persist, todo))
  .map(() => put({type: 'SAVED_TO_DATABASE'}))
```

- `listen` just listens to events on the AppDispatcher.
- `call` returns a "promise" to call `persist`.
- `put` puts messages on the AppDispatcher.
- a `SideEffectsBus` listens for `call` messages and actually performs the action.

This approach has several advantages:

- the relationship between a store and its side effects is crystal clear (because the store initiates the side effect).
- no higher order functions, so it's easier to understand.
- stores are pure functions, so they're easy to reason about and test
- side effects are also pure functions, while still using FRP.

The biggest downside is:

- boilerplate

## A More Complex Workflow

The workflow is taken from the
[redux-saga non-blocking example](http://yelouafi.github.io/redux-saga/docs/advanced/NonBlockingCalls.html).

```javascript
import {put, call, listen} from '...'
import Api from '...'

function authorize(user, password) {
    return call(Api.authorize, user, password)
        .take(1)
        .onError(error => put({type: 'LOGIN_ERROR', error}))
        .onError(() => call(Api.clearItem, 'token'))
}

function loginFlow() {

    const loginStream = listen('LOGIN_REQUEST') // emits {user, password}
    const logoutStream = listen('LOGOUT') // fires when user clicks logout button
    const authStream =
        loginStream.flatMapLatest(
            ({user, password}) => authorize(user, password).takeUntilBy(logoutStream)
        )

    authorizeStream
        .flatMap(token => {
            put({type: 'LOGIN_SUCCESS', token})
            return call(Api.storeItem, {token})
        }).onValue(() => undefined) //add a listener otherwise nothing happens

    logoutStream
        .flatMap(() => call(Api.clearItem, 'token'))
        .onValue(() => undefined) //add a listener otherwise nothing happens
}
```

Roughly speaking, this code
- tries to authorize after receiving a login request.
- stops listening to the pending auth task (if any) when logging out
- stores the auth token after authorizing
- clears the auth token after logout or login error occurs

Note that this code handles multiple login requests!

The marble-diagram shows some edge cases that this code handles:

```
Straightforward case
    loginStream: -------------------o---->
authorizeStream: ---------------a-------->
   logoutStream: ---------l-------------->

Edge case (logout before auth finishes)
    loginStream: -------------------o---->
authorizeStream: --------a--------------->
   logoutStream: -------------l---------->

Edge case (two logins before auth finishes)
    loginStream: ---------------o---o---->
authorizeStream: ----a---a--------------->
   logoutStream: -l---------------------->

Crazy edge case
    loginStream: ---------------o---o---->
authorizeStream: ----a---a--------------->
   logoutStream: -l---------l------------>
```

- `flatMapLatest` picks the last auth request, so we can log in as many times as we want
  without waiting for the auth to finish.
- `takeUntilBy` discards the auth stream whenever a logout event happens.
