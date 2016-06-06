import React from 'react';
import ReactDOM from 'react-dom';

import Bacon from 'baconjs'

import Stream from './Stream'


const style = {
	margin: '0 0 1em 0'
}

export default class InputStream extends React.Component {

    constructor(props) {

        super(props)

        this.inputBus = new Bacon.Bus()
    }

    render() {

//		const transform =
		const stream = this.props.transform(this.inputBus)

        return (
            <div>
                <input
					style={style}
					defaultValue=""
					type="text"
					onChange={e => this.inputBus.push(e.target.value.substring(e.target.value.length - 1))}/>
                <Stream stream={stream}></Stream>
            </div>
        )
    }
}

InputStream.defaultProps = {
	transform: {
		name: 'map',
		fn: x => x
	}
}
