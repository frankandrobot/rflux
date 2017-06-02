# Overview
One of the problems I've noticed when working with functional reactive programming (FRP)
is that many online resources:

-   assume you already know what FRP is
-   assume you won’t create anything more complex than a toy app
-   focuses on the “reactive” part, ignoring the functional programming

Let’s start fixing that by answering, “What is *functional programming (FP)*?”

## Functional Programming (FP)

As per the [c2 wiki](http://c2.com/cgi/wiki?FunctionalProgramming),
a **functional programming language** provides:

-   first class functions
-   higher order functions
-   closures
-   pattern matching
-   single assignment
-   lazy evaluation
-   garbage collection
-   type inference
-   tail call optimization
-   list comprehensions
-   monads

In case you haven’t noticed, Javascript has some functional programming features:

1.  first class functions — you can assign functions to variables and pass them as arguments
2.  higher order functions — you can create a function that returns a function
3.  closures
4.  single assignment — via `const`
5.  garbage collection
6.  monads — as far as I can tell,
    [Promises are monad like](https://curiosity-driven.org/monads-in-javascript).
    (Yea, you’ve used monads without knowing it.)

Before you do an Internet search on the above terms,
an important FP concept relevant to FRP is *pure functions*.

### Pure Functions

> **pure functions** always evaluate to the same result in any context.
>
> No side effects.
>
> No hidden dependencies.

As an imperative programmer, most of the functions you're used to working with are NOT
pure functions. For instance, the following are NOT pure functions:

```javascript
function square(x) {
  // the result depends on whether or not
  // the database is up
  return x * x * databaseValue()
}
```

```javascript
function square(x) {
  // mutates the argument
  x.val = x.val * x.val
  return x.val
}
```

```javascript
function square(x) {
  // mutates global state
  global = x
  return x * x
}
```

### <a name="purity">Why be Pure? Why Use FP?</a>

It's not too hard to see how parallelism is easier with pure functions and
*immutable data structures* (see below).

In classical Java multi-threaded programming,
two or more threads compete for access to the same data. That means that you,
the developer, spend time and brain power managing access to the same data.  
Things get messy really quick---code is hard to debug and hard to reason about,
and therefore, you're never sure if the code really works!

What if we used pure functions and immutable data structures?

An **immutable data structure** cannot be modified in any way after its creation.

Therefore, if we use immutable data structures, whatever one thread does to the
"shared" state won't be seen by other threads. If we also use pure functions,
then we don't have to worry about two threads accidentally stepping on each
other's toes (via side effects). That means no more playing traffic cop!

As a Javascript developer, you're may be thinking,
"Who cares? Javascript is single threaded."

One reason we should care is because we write code like this all the time:

```javascript
function1(todos) {
  delete todo[1]
}

function2(todos) {
  todo[1].foo = // ...
}

const todos = //...
// pass the same object by reference
function1(todos)
function2(todos) // null pointer error!
```

A second reason is because writing in functional style allows us to use the
same frameworks and techniques across the front-end and the back-end.
If you're a full-stack engineer, that's a huge win.

## <a name="#frp">Functional Reactive Programming (FRP)</a>
We still haven’t answered the question, “What is functional reactive programming?”

> **functional reactive programming (FRP)** is functional programming
> with asynchronous data streams.
>
> Think of an **asynchronous data stream** as a possibly infinite array
> whose items are available over time.

From personal experience, learning `map` and `reduce/scan` will go a long way
towards making FRP comprehensible.<sup>[\*](#reactivex)</sup>
(In fact, I suspect FRP is just syntactic sugar for (1) `map`, (2) `reduce`,
and (3) ways to combine streams.)

`map` and `reduce` work just like the `lodash`/`underscore`/ES6 versions of `map` and `reduce`.

Array versions:

```javascript
const array = ['a', 'b', 'c', 'd', 'e']

array.map(x => x.toUpperCase())
// [A, B, C, D, E]

array.reduce((total, x) => total + x, '')
// "abcde"
```

Stream versions:

```javascript
const stream = //... containing 'a', 'b', 'c', 'd', 'e'

stream.map(x => x.toUpperCase())
// [A, B, C, D, E]

stream.reduce((total, x) => total + x, '')
// "abcde"

// scan works just like reduce, except that it fires for every event
stream.scan((total, x) => total + x, '')
// "a"
// "ab"
// "abc"
// "abcd"
// "abcde"
```
Note: if the stream never ends, `reduce` never produces a value. `scan` always emits values.

Every time you apply a transformation function, like `map` or `reduce`, you get a new stream.
You can chain transformation functions together.

```javascript
// do both
stream
   .map(x => x.toUpperCase())
   .reduce((total, x) => total + x, '')
// "ABCDE"
```

In order to get values from a stream, FRP implements the Observer Pattern.
Streams are *observables* and the *observers* (aka *subscribers* aka *listeners*)
are just callback functions. In BaconJS and KefirJS, `onValue` attach observers.

```javascript
stream
  .map(x => x.toUpperCase())
  .onValue(x => console.log(x))
```

Note: Nothing happens unless you attach an observer.

An important point is that an observer lasts forever unless you explicitly kill it
or the stream ends. This can be a source of *memory leaks*.

**In case you haven’t noticed, streams generalize Promises.**
A stream is just a Promise that may or may not end.

<a name="#reactivex">\*</a>The [Reactivex Tutorial](http://reactivex.io/learnrx/)
seems to agree (with the addition of `concatAll` as a must-learn function).

## Javascript FRP libraries

-   [KefirJS](https://rpominov.github.io/kefir/) - Pros: super fast, super simple.
Cons: relatively obscure
-   [RxJS](https://github.com/ReactiveX/RxJS) - Pros: relatively well known;
versions exist for Java. Cons: Good luck finding comprehensible documentation.
-   [BaconJS](https://baconjs.github.io/) - Pros: super easy to learn. Ideal for newbies.
Cons: Slowest of the libraries, so probably not the best for production code (specially in the backend).
Also, it may have memory leaks.
-   [HighlandJS](http://highlandjs.org/) - Pros: combines Promises, NodeJS Streams,
and FRP streams under a single framework (hence the name “highland”).
Cons: while faster than BaconJS, not performant; not as polished.

## Useful Resources

-   The aforementioned [Reactivex tutorial](http://reactivex.io/learnrx/)
-   [The Intro to FRP You've been Missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)

## A Note About Terminology

In KefirJS and BaconJS, *streams* are one type of Observable.
(The other type of Observable is **Property**.)

For the rest of these articles, we'll assume *streams* refer to KefirJS/BaconJS streams.
