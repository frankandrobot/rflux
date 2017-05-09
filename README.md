# rflux

ReactJS Flux/Redux reimagined using Functional Reactive Programming with KefirJS.

## Installation

```bash
jspm install rflux=github:frankandrobot/rflux
```

This is a JSPM ES6 library that's been transpiled to ES5.
It probably works with Webpack and Browsify since it ships with the CommonJS module format.
However, it's been tested primarily with JSPM/SystemJS.

Because it's a modern library, the distributable isn't minified---it's expected that Webpack, Browsify, JSPM
will minifiy it for you.

The minified is coming in at less than 20k. With KefirJS, that's less than 30k!

## Documentation

Checkout the [docs](./doc/).

Sample usage, for now, can be found at: https://github.com/awesome-editor/awesome-editor/
