# Overview

**rflux** implements Facebook's one-way Flux pattern. It is similar to `redux` but with
several differences: 

-  state is observed via streams (aka observables)
-  instead of one global store, there are many stores combined (at runtime) into a 
   single global store. 
   - each store is associated with a single `channel`.
   - messages flowing into a channel have an `ActionType` (aka `Action`).
   - one reducer (or handler) per action type.
   - action functions are how you get anything done
-  a `redux-saga`-like framework is built-in. 
-  it is possible to dispatch messages to other reducers and sagas from inside a 
   reducer (like `flux`) _while staying pure (unlike `flux`)_.
-  the global store includes *bound* action functions that can be called to dispatch 
   actions (convenience).
