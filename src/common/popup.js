import React from 'react'
import ReactDOM from 'react-dom'

const root = document.querySelector('#app-frame')

const buttonStyle = {
  background: 'yellow',
  border: null,
  width: 80,
  height: 30,
  borderRadius: 10
}

class App extends React.Component {
  state = {
    count: 0
  }

  handleClick = (actionType, ...params) => e => {
    const actions = {
      INCREMENT: () => this.setState({ count: this.state.count + 1 }),
      DECREMENT: () => this.setState({ count: this.state.count - 1 })
    }

    actions[actionType](...params)
  }

  render = () => (
    <>
      <h1>Hello :thonking:</h1>

      <h2>Count: {this.state.count}</h2>

      <button style={buttonStyle} onClick={this.handleClick('DECREMENT')}>
        -
      </button>
      <button style={buttonStyle} onClick={this.handleClick('INCREMENT')}>
        +
      </button>
    </>
  )
}

ReactDOM.render(<App />, root)
