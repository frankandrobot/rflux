# Side Effects

Routing everything through the [AppDispatcher](./02-dispatcher.md) is a good thing
because it buys us:

- *time travel*---traveling back in time to any app state.
- logging everything for free
- recording and replaying actions

Therefore, we need side effects to also route through the AppDispatcher.
Fortunately, FP has a well-known way of handling side effects---monads.

## Freakin. Monads.

The word *monad* has become a curse word.
Part of the problem is that the online tutorials often hide a very
simple concept behind complex (math) language.
Another problem is that the same tutorials often assume you know Haskell.

For the purposes of this article, all you need to know about *monads* and
*Category theory* is that they provide a rigorous mathematical theory
(a toolbox if you will) for common programming problems.
In particular, the "monadic solution" for side effects is to
return a list of instructions to perform. For example, to update another store
from a reducer function:

```javascript
//Store.js
function update(newValue) {
    return {
        newValue,
        sideEffects: [
            {channel: 'AnotherStore', actionType: 'update', payload: {newValue}}
        ]
    }
}
```

"side effects" are then just plain, old messages that can be routed through the
AppDispatcher.

I should point out this particular "side effect" is just passing a message to another
store. Alternatively, we could have somehow listened to changes in `Store` in `AnotherStore`.
However, it is better (for maintainability) to make relationships explicit i.e.,
explicitly call `AnotherStore` in `Store`. (This is an *opinion*.)

We now need a way of handling status messages (like loading) and
returning the final result of a side effect.

## The Straightforward Approach
This is a side effect that fetches a doc:

```javascript
function fetchDoc(uuid) {
    //let the app know you're fetching a doc so it can show a Toast or something
    AppDispatcher.emit({channel: 'app', actionType: 'fetchingDoc'})
    //actually fetch the doc
    fetch(url, uuid).then(doc => {
       AppDispatcher.emit({channel: 'doc', actionType: 'load', payload: doc})
    })
}
```

Note that it's better practice to call `action functions` (instead of manually
creating messages. See [action functions](./07-action-functions.md))

The only problem with the `Straightforward Approach` is testability.

## Sagas
What if `fetchDoc` looked like this?

```javascript
import {put, call} from //...

function fetchDoc(uuid) {
   //instead of `emit', `put` messages in AppDispatcher
   put({channel: 'app', actionType: 'fetchingDoc'})

   // We technically need to unsubscribe the onValue callback
   // However, if we make #call take(1), then unsub isn't needed

   call(fetch, url, uuid).onValue(
     doc => emit({channel: 'doc', actionType: 'load', payload: doc})
   )
}
```
where `put` routes messages to the AppDispatcher and `call` calls the given function.

This is in fact the approach that [Redux Saga](https://github.com/yelouafi/redux-saga)
takes where instead of Streams it uses [generator functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).

A **saga** is a long-running process that can be divided up into
independent parts. Without getting into the specifics, unit testing generators
is almost trivial. Unfortunately, the main problem with this approach
is that async events are difficult to handle. But that's where FRP shines.

The code below (taken from the [non-blocking call example](http://yelouafi.github.io/redux-saga/docs/advanced/NonBlockingCalls.html))
handles a login process. Notice the inclusion of new Saga functions: fork and take.  
`fork` puts the `authorize` action in the background (and proceeds to the next line)
and `take` waits for events in the AppDispatcher.

```javascript
import { fork, call, take, put } from 'redux-saga/effects'
import Api from '...'

function* authorize(user, password) {
  try {
    const token = yield call(Api.authorize, user, password)
    yield put({type: 'LOGIN_SUCCESS', token})
    yield call(Api.storeItem, {token})
  } catch(error) {
    yield put({type: 'LOGIN_ERROR', error})
  }
}

function* loginFlow() {
  while (true) {
    const {user, password} = yield take('LOGIN_REQUEST')
    const task = yield fork(authorize, user, password)
    const action = yield take(['LOGOUT', 'LOGIN_ERROR'])
    if (action.type === 'LOGOUT')
      yield cancel(task)
    yield call(Api.clearItem, 'token')
  }
}
```

Roughly speaking, this code
- tries to authorize after receiving a login request.
- waits for a logout or login error event while it authorizes
- cancels the pending auth task (if any) when logging out
- stores the auth token after authorizing
- clears the auth token after logout or login error occurs

Notice that if you try to login twice (before authorizing completes), this
event won't be handled!

### Sagas: the FRP way
Instead of generators, let's use Streams:

-   use a `SideEffects` bus to handle side effect events
-   `put` routes messages to AppDispatcher and returns void
-   `call` works like the redux-saga. The difference is that it uses the SideEffects
    bus. It also wraps the result of the function call in a Stream
-   `listen` works just like `take`---it listens to events on the AppDispatcher

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

Note that this code *does* handle multiple login requests!

[Marble-diagram](http://rxmarbles.com/#sample)-like diagrams can really help:

```
Simple case
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
