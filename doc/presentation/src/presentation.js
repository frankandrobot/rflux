import React from 'react';
import ReactDOM from 'react-dom';

import ButtonStream from './buttonStream'
import InputStream from './InputStream'


Reveal.addEventListener(
  'buttonStream',
  () => ReactDOM.render(<ButtonStream />, document.querySelector('#buttonStream')),
  false
)

Reveal.addEventListener('mapStream', function() {
  ReactDOM.render(
    <InputStream transform={stream => stream.map(x => x.toUpperCase())}/>,
    document.querySelector('#mapStream')
  )
}, false)

Reveal.addEventListener('mapStream', function() {
  ReactDOM.render(
    <InputStream transform={stream => stream.scan(0, (total,x) => Number.isInteger(+x) ? total + (+x) : total)}/>,
    document.querySelector('#scanStream')
  )
}, false)
