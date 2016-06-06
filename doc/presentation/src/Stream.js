import React from 'react';
import ReactDOM from 'react-dom';

import Bacon from 'baconjs'
import {Motion, spring} from 'react-motion'


class Stream extends React.Component {

  constructor(props) {
    super(props)

    this.state = {width: 0, values: []}
  }

  componentWillMount() {

    this.unsub = this.props.stream
      .scan([], (values, value) => values.concat([{value, timestamp: new Date().getTime()}]))
      .onValue(values => this.setState({values}))
  }

  componentWillUnmount() {

    this.unsub()
  }

  render() {

    const values = this.state.values

    return (
      <div
        ref={c => c && this.state.width === 0 && this.setState({width: c.clientWidth})}
        style={{
          width:'30em',
          height:'1em',
          background: 'transparent',
          padding: '0px',
          lineHeight: '1',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden'
        }}>
        {values.map((val, i) =>
          <Motion
            key={val.timestamp}
            defaultStyle={{x: 0}}
            style={{x: spring(this.state.width, {damping: 75, stiffness: 100})}}
            onRest={() => this.setState({values: values.splice(i, 1)})}>
            {({x}) =>
              <div style={{
                padding: '0px',
                margin: '0px',
                WebkitTransform: `translate3d(${x}px, 0, 0)`,
                transform: `translate3d(${x}px, 0, 0)`,
                position: 'absolute' }}>
                {val.value}
              </div>}
          </Motion>
        )}
      </div>
    )
  }
}

Stream.defaultProps = {
  stream: Bacon.once('go')
}

export default Stream
