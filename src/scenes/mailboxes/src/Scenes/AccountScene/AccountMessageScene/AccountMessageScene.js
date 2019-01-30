import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog } from 'wbui/RouterDialog'
import AccountMessageSceneContent from './AccountMessageSceneContent'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class AccountMessageScene extends React.Component {
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
    settingsActions.sub.app.setSeenAccountMessageUrl(this.state.url)
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
        <AccountMessageSceneContent />
      </RouterDialog>
    )
  }
}

export default AccountMessageScene
