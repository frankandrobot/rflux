# actions and action observables
- actions are disassociated from action observables.
  With pure FRP, you can do something like this:
  
```javascript
function createDoc(doc) {
   AppDispatcher.emit({actionType: 'create', payload: doc})
   
   return docObservable.map(doc => doc.uuid)
}
```
   i.e., the action can return a stream that tells you when it succeeded.
   
- with this system, the connection actions and its observables are not
necessarily clear. However, we can map them using helper functions.

# sideeffects
- we have a similar problem with side effects.
  Before, we could do something like this (and call it directly):

```javascript
function lookupTags(tag) {
    return fetch(url, {tag})
}
```

  i.e., execute side effects outside of the dispatcher.
  However, because we want to track everything in the AppDispatcher,
  it now looks like this
  
```javascript
/// actions.js
function lookupTags(tag) {
    return {actionType: 'lookup', payload: tag}
}

function lookupTagResult(tag) {
    return {actionType: 'lookupResult', payload: tag}
}
```

```javascript
// sideeffects.js
function lookupTags(tag) {
    return fetch(url, {tag}).onValue(result => lookupTagResult(result))
}
```

```javascript
// plus add reducer to handle the result
// plus add an observer... this is a pain in the pass
```

# sagas

Alternative? (Hey look almost a saga)
```javascript
// sideeffects.js
function lookupTags(tag) {
    AppState.lookupTag(tag) //record start
    return fetch(url,{tag}).take(1).onValue(result => AppState.lookupTagStoreResult(result))
}
```

We also lost the ability to mock out side effects easily.

This is what a saga looks like:

```javascript
import { call, put } from 'redux-saga';  

function* lookupTag(tag) {  
    yield put({ type: 'LOOKUP_TAG' });
    const tags = yield call(fetch, '/tag');
    yield put({ type: 'MATCHES', payload: tags });
}
```

The generator buys unit testing (because it's a pure function).
Also, sagas can run forever and take inputs.
They are their own full app store.


```javascript
function loadTag(action) {

  if (action.actionType === 'loadTag') {
     AppState.lookupTag(tag) //record start
     //actually, these are a bad idea. Calling these outside of here 
     //makes no sense
     return call(fetch, tag).take(1).onValue(AppState.lookupTagStoreResult)
  }
}
```

The catch is `call`. In testing, it doesn't have to call anything.
Sagas that run forever is probably a bad idea.

How do we hook it up?

stores are just pure functions, so it's not a store.
We can't pass it to the app store.
i
