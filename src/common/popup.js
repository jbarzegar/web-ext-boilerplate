/* global browser */
import React, { Fragment } from 'react'
import ReactDOM from 'react-dom'

const root = document.querySelector('#app-frame')

const buttonStyle = {
  background: 'yellow',
  border: null,
  width: 80,
  height: 30,
  borderRadius: 10
}

class Counter extends React.Component {
  state = {
    count: 0
  }
  async componentDidMount() {
    const count = (await browser.storage.local.get('count')) || this.state.count

    this.setCount({ count })
  }
  setCount = () => browser.storage.local.set({ count: this.state.count })
  handleClick = (actionType, ...params) => e => {
    const actions = {
      INCREMENT: () => {
        this.setState({ count: this.state.count + 1 }, this.setCount)
      },
      DECREMENT: () =>
        this.setState({ count: this.state.count - 1 }, this.setCount)
    }

    actions[actionType](...params)
  }

  render = () => (
    <Fragment>
      <h1>Hello world</h1>

      <h2>Count: {this.state.count}</h2>

      <button style={buttonStyle} onClick={this.handleClick('DECREMENT')}>
        -
      </button>
      <button style={buttonStyle} onClick={this.handleClick('INCREMENT')}>
        +
      </button>
    </Fragment>
  )
}

const App = () => (
  <Fragment>
    <Counter />
  </Fragment>
)

ReactDOM.render(<App />, root)
