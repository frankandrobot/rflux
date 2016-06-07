# rflux

ReactJS Flux/Redux reimagined using Functional Reactive Programming with KefirJS.

Early alpha for now. For now, you can checkout a stable (older) version at:

https://github.com/awesome-editor/awesome-editor/tree/master/src/rflux

## Installation

```bash
jspm install frankandrobot/rflux
```

This is a JSPM ES6 library that's been transpiled to ES5.
It probably works with Webpack and Browsify since it ships with the CommonJS module format.
However, it's been tested primarily with JSPM/SystemJS.

Because it's a modern library, the distributable isn't minified---it's expected that Webpack, Browsify, JSPM 
will minifiy it for you.

Minified it's coming it at less than 20k. With KefirJS, it's less than 30k!
(Speaking of which, I need to figure out why it's bigger than KefirJS when minified.)

## Documentation

Checkout the [docs](/docs/).
