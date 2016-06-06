import React from 'react';
import ReactDOM from 'react-dom';

import Bacon from 'baconjs'

import Stream from './Stream'


const buttonStyle = {
  backgroundColor: '#44c767',
  borderRadius: '28px',
  border: '1px solid #18ab29',
  display: 'inline-block',
  cursor: 'pointer',
  color: '#ffffff',
  fontSize: '17px',
  padding: '16px 31px',
  textDecoration: 'none',
  textShadow: '0px 1px 0px #2f6627',
    margin: '0 0 2em 0'
}

export default class ButtonStream extends React.Component {

    constructor(props) {

        super(props)

        this.clickBus = new Bacon.Bus()
    }

    render() {
        return (
            <div>
                <button style={buttonStyle} onClick={() => this.clickBus.push('X')}>Click</button>
                <Stream stream={this.clickBus} stateName='buttonStream'></Stream>
            </div>
        )
    }
}
