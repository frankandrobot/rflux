# Immutability

As alluded to in [the intro](./01-fp-overview.md#purity),
immutability also makes sense in Javascript.

## Use `Object.assign` or the Object Spread Operator

The idea is to create shallow copies of objects.
For example, the code below returns an object that's a shallow copy of
the todos (that's what the [object spread operator](https://github.com/sebmarkbage/ecmascript-rest-spread)
does), then overrides the todo with the latest copy.

```javascript
function updateTodo(todos, todo) {
  return {...todos, [todo.id]: todo}
}
```

This approach is perfect for toy apps and quick prototypes.
One drawback is that it's error prone---it is very easy to forget to use
`Object.assign`/the spread operator, and the code still works until
it throws weird bugs. The other issue is that you're creating shallow copies of objects---
this quickly becomes inefficient as soon as your data grows.

## Use an Immutable Library

[ImmutableJS](https://facebook.github.io/immutable-js/) is easy to use and performant.
It's also very popular.
