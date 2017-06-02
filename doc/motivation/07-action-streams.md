# Action Streams

In case you haven't noticed, while we have a way of dispatching events,
we don't yet have a way of listening to *fine-grained* events.
For example, if we create a todo, how do we know the todo was created?
how do we get the new todo id?

```javascript
//TodoReducer.js
export function createTodo(todos, todo) {
    const newTodo = {...todo, id: uuid.v4()}
    return {...todos, [newTodo.id]: newTodo}
}

export function updateTodo(todos, todo) {
    const updatedTodo = {...todos[todo.id], ...todo}
    return {...todos}
}
```

Recall (from [03-stores](./03-stores.md)) that we get a Stream, called `todoStream`,
containing the store data.

```javascript
// File.js
todoStream.onValue(todos => console.log(todos))
```

Updates are easy to handle. We can create a Stream that exposes the updated todo.

```javascript
export function updateTodoStream(id) {
    return todoStream.map(todos => todos[id])
}
```

Creation is trickier. We have two strategies:

1. Create an extra store property to store the newly created id
   and expose this property via an Observable.
2. Route a message to AppDispatcher containing the newly created id and then
   expose the message via an Observable

## Solution 1: Extra Store Property

```javascript
//TodoReducer.js
export function createTodo(todos, todo) {
    const newTodo = {...todo, id: uuid.v4()}
    return {...todos, [newTodo.id]: newTodo, newId: newTodo.id}
}

//TodoActionStreams.js
export function createTodoStream() {
    return todoStream.map(todos => todos.newId)
        .filter(newId => newId) //newId is null *before* you create the first todo
        .take(1)
}
```

Something about this solution seems fishy. We've just created an extra property (`newId`)
to (temporarily) store the new id.


## Solution 2: Extra Message

```javascript
//TodoReducer.js
export function createTodo(todos, todo) {
    todo.id = uuid.v4()
    todos[todo.id] = todo
    return withSideEffects(todos, {channel: 'todos', actionType: 'created', payload: todo})
}

//TodoActionStream.js
export function todoCreatedStream() {
    return AppDispatcher
        .filter(event => event.channel === 'todos' && event.actionType === 'created')
        .map(event => event.payload)
        .take(1)
}
```

One downside to this approach is boilerplate---you may want to create
an [action function](./07-action-functions.md) for the 'created' event.
(At the very least you'll need to create a Constant for the new actionType.)
