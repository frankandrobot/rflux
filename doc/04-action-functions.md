# Action functions

Throughout, we have been manually passing messages to the AppDispatcher. Ex:

```javascript
AppDispatcher.push({channel: 'todos', actionType: 'create', payload: ...})
```

This is fine for small apps. For large apps, this approach is error prone.
It makes sense to hide #push behind a function call.

```javascript
function createTodo(todo) {
  AppDispatcher.push({channel: 'todos', actionType: 'create', payload: ...})
}
```

That's fine except that the function is a pain to test because it's not pure.
Can we do better? Why yes, yes we can.

```javascript
function createTodo(todo) {
  return {channel: Channels.todos, actionType: TodoActionTypes.create, payload: todo}
}
```

It's not too hard to write a helper function that hooks up *action functions*
to the AppDispatcher. Notice also how we're using *constants*.

**Action functions** can be thought of as pure functions that return a promise
to actually do the action.
