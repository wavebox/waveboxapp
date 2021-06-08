import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog } from 'wbui/RouterDialog'
import NewsSceneContent from './NewsSceneContent'
import { ipcRenderer } from 'electron'
import {
  WB_MAILBOXES_WINDOW_SHOW_NEWS
} from 'shared/ipcEvents'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class NewsScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    ipcRenderer.on(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.handleIPCOpen)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener(WB_MAILBOXES_WINDOW_SHOW_NEWS, this.handleIPCOpen)
  }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  handleIPCOpen = () => {
    window.location.hash = '/news'
  }

  /**
  * Closes the modal
  */
  handleClose = () => {
    window.location.hash = '/'
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        disableRestoreFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <NewsSceneContent />
      </RouterDialog>
    )
  }
}

export default NewsScene
