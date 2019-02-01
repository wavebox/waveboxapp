import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import AccountAuthSceneContent from './AccountAuthSceneContent'

const styles = {
  root: {
    minWidth: 700,
    maxWidth: 850
  }
}

@withStyles(styles)
class AccountAuthScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    routeName: PropTypes.string.isRequired
  }

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
    const { routeName, classes } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={AccountAuthSceneContent} />
      </RouterDialog>
    )
  }
}

export default AccountAuthScene
