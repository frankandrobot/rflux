# The Dispatcher as a Stream

If you look at the existing Flux architecture, at the 10,000ft level, it already uses *functional reactive programming*.

<img src="https://facebook.github.io/flux/img/flux-simple-f8-diagram-with-client-action-1300w.png" alt="" />


-   The Dispatcher is an Observable accepting inputs (Actions)
-   The Dispatcher re-emits Actions to its Observers.
-   Stores observe the Dispatcher and act accordingly.

We can thus replace the Dispatcher with an Observable that accepts inputs. In `BaconJS`, for example, it’s called a `Bus`<sup>[*](#footnote)</sup>. The Dispatcher is just this in FRP:

```javascript
//AppDispatcher.js
import Bacon from 'baconjs'

export default new Bacon.Bus()
```

Actions can look like this:

```javascript
//TodoActions.js
import AppDispatcher from 'AppDispatcher'

export default {

  addTodo: function(todo) {

    AppDispatcher.push({
       channel: 'todo',
       actionType: 'create',
       data: todo
   })
 }    
}
```

So far, the FRP ReactJS app looks like a run-of-the-mill Flux app. Things get interesting when we get to Stores…

By the way, we use a single global dispatcher to reap the benefits of FRP—the Actions passed to the Dispatcher plus the states of the stores <em>completely define the App state at any moment in time</em>. We can therefore easily replay the state of the App (for debugging). Did I also mention we get undo functionality for free? Pretty. Freakin’. Cool.

<a name="footnote">\*</a> Buses are a controversial feature in FRP because they are a source of timing-related bugs when used improperly. In fact, KefirJS actually [deprecated buses](https://github.com/rpominov/kefir/issues/88). You should be fine, though, because bus-as-app-dispatcher is a valid use case.
