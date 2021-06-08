import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'

export default class DeferredRender extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    wait: PropTypes.number.isRequired,
    renderer: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.waitTO = setTimeout(() => {
      this.setState({ render: true })
    }, this.props.wait)
  }

  componentWillUnmount () {
    clearTimeout(this.waitTO)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = { render: false }

  /* **************************************************************************/
  // Render
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { renderer, ...passProps } = this.props
    if (this.state.render) {
      return renderer(passProps)
    } else {
      return false
    }
  }
}
