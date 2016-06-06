# Use Immutable Objects

Wait. Wat? We're in the Javascript world (single threaded).
I thought that [immutability made sense only in multi-threaded applications]
(http://miles.no/blogg/why-care-about-functional-programming-part-1-immutability).

You're forgetting the UI thread.

If you mutate an object that's directly rendered in the UI (say as a list),
then the app will throw up if said object disappears while the UI expects it to be there.
(This was actually the cause of a bug we saw in a real-world app.)

The solution is to use an immutable library, like [ImmutableJS](https://facebook.github.io/immutable-js/)
or create immutable top-level objects using the
[object spread operator](https://github.com/sebmarkbage/ecmascript-rest-spread)
or `Object.assign`.

```javascript
function createTodo(todos, todo) {

    const newTodo = {...todo, id: uuid.v4()}
    const newTodoEntry = {[newTodo.id]: newTodo}
    return {...todos, newTodoEntry}
}
```

\#createTodo not only creates a shallow copy of the todo but also returns a
shallow copy of the original `todos`. Therefore, even if we delete an entry,
the UI won't complain.

The object spread operator and `Object.assign` have downsides:

1.  It's error prone. It is very easy to use incorrectly or forget to use.
2.  It's inefficient. Imagine the `todo` list contains 1000s of todo items.
    This will create 1000s of shallow copies.
