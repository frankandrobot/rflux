I follow the [Presentation Zen](http://presentationzen.blogs.com/presentationzen/2005/09/whats_good_powe.html)
style of presenting, so these slides won't make any sense without me.
You're probably looking for the [detailed docs](../).

These slides aren't completely useless, though.
Inside these slides you'll find a React component that visually animates a stream.
See [below](#component).

# Installing

Yes, you have to "install" this presentation if you want to run the React stream component.
The what? See [below](#component)

```sh
npm install -g http-server
npm install
node node_modules/jspm/cli.js install -y
```

# Running

```sh
http-server
```

Then open your browser at http://localhost:8080

# <a name="#component">React Stream Component</a>

I wrote a simple React component using `react-motion` that takes a stream
and animates whatever values get pushed to the stream.

See [src/Stream.js](./src/Stream.js).

This is written in ES6. And needs JSPM and Babel to load and transpile on the fly.
