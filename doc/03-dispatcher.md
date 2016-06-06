# One-Way Data Flow

Every store-creation strategy [we've considered](./02-stores.md) follows
Flux's one-way data flow:

<img src="https://facebook.github.io/flux/img/flux-simple-f8-diagram-with-client-action-1300w.png" alt="" />

-   The Dispatcher is an Observable accepting inputs (Actions)
-   Stores are just `scan` functions that accumulate store state.
-   Views observe store streams

# AppDispatcher as a Bus

The AppDispatcher is an Observable that accepts input. In BaconJS parlance,
it's a **bus**; in KefirJS, it's called an **emitter**; in RxJS, it's called a **subject**.

Buses are library primitives. For example, in BaconJS, creating a bus is as simple as:

```javascript
//AppDispatcher.js
export default new Bacon.Bus()
```

Please be aware that buses are actually a controversial feature in FRP.
However, they were created for exactly this use case---to
[provide a reactive interface to an imperative system, like ReactJS](https://www.reddit.com/r/reactjs/comments/3ruqw2/rxjs_or_kefir_worth_it_with_react/cx6oncs).
So using buses in ReactJS is fine.

As [alluded in the previous article](./02-stores.md#antipattern),
buses come with gotchas. For example, missed events:

```javascript
AppDispatcher.push({
  type: 'create',
  payload: 'hello world'
})

// The listener never fires because it is setup *after* the event takes place.
createActionStream.onValue(() => console.log('todo created'))
```

Upon closer analysis, the issue isn't really with buses per se but with the observer.

## Solution 1: Use the Event Queue

What if we reorder the function calls with `setTimeout`?
We can wrap the message in a `setTimeout` with a timeout of 0
(so that it executes as soon as possible but *after* the current function context).

```javascript
setTimeout(() => AppDispatcher.push({
  type: 'create',
  payload: 'hello world'
}), 0)

//this listener will now work
createActionStream.onValue(() => console.log('todo created'))
```

## Solution 2: Reorder the Function Calls

```javascript
createActionStream.onValue(() => console.log('todo created'))

AppDispatcher.push({
  type: 'create',
  payload: 'hello world'
})
```

## Shootout
The main problem the `Event Queue Solution` is when it comes time to mix
imperative code with the delayed message passing---things will run in the wrong order!

```javascript
// put AppDispatcher#push behind a function like a normal developer
const create = () => setTimeout(() => AppDispatcher.push({...}))

create()
someImperativeCode()
// actually runs in the opposite order!
```

The main problem with the `Reordering Solution` is that it's error prone---
it's so easy to put the listener in the wrong order.

**Winner:** None

The more I investigate failed solution attempts
(like using `Kefir.pool` instead of a bus or using a `Property` instead of a Stream),
the more and more it seems that the correct solution is

> Don't write code like this i.e., try not to create listeners on the fly.
> Instead, first setup your observers, then do stuff.

# AppDispatcher Implementations

## BaconJS

```javascript
//AppDispatcher.js
export default new Bacon.Bus()
```

## KefirJS

KefirJS actually [deprecated buses](https://github.com/rpominov/kefir/issues/88).
You can implement your own using `Kefir.stream`.

Alternatively, you can use a `Kefir.pool`.

```javascript
//AppDispatcher.js
export default Kefir.pool()
```

You then pass messages with slightly more boilerplate:

```javascript
AppDispatcher.plug(Kefir.constant({
  type: 'create',
  payload: 'hello world'  
}))
```

# Why Have a Single Global Dispatcher?

One consequence of having a single global dispatcher is that we can log everything.
And that brings us one step closer to *time travel*.
