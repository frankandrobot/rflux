# Action functions

AppDispatcher events are defined as objects with a `channel`, an `actionType`, and a payload.
Throughout, we have been manually passing messages to AppDispatcher. Ex:

```javascript
AppDispatcher.emit({channel: 'todos', actionType: 'create', payload: ...})
```

This is fine for small apps. For large apps, you want to use **action functions**
as well as a *constants* file for maintainability. (This is an *opinion*.)

```javascript
function createTodo(todo) {

    return {channel: Channels.todos, actionType: TodoActionTypes.create, payload: todo}
}
```

For large apps, action functions answer the following questions:

1. Hod do you easily refactor an action? (For small apps, this is a no brainer)
2. How do you easily find usages?

You trade boilerplate for maintainability.
