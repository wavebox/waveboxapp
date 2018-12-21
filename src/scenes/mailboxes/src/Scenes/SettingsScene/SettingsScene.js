import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog, RouterDialogMatchProvider } from 'Components/RouterDialog'
import SettingsSceneContent from './SettingsSceneContent'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class SettingsScene extends React.Component {
  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

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
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogMatchProvider routeName={routeName} Component={SettingsSceneContent} />
      </RouterDialog>
    )
  }
}

export default SettingsScene
