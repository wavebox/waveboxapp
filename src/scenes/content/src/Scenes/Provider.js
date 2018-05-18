import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import Theme from 'wbui/Theme'
import { MuiThemeProvider } from '@material-ui/core/styles'
import BrowserScene from './BrowserScene'

export default class Provider extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    url: PropTypes.string.isRequired,
    partition: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { url, partition } = this.props

    return (
      <MuiThemeProvider theme={Theme}>
        <BrowserScene url={url} partition={partition} />
      </MuiThemeProvider>
    )
  }
}
