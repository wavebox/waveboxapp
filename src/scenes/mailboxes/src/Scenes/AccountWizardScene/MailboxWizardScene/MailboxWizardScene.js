import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import MailboxWizardSceneContent from './MailboxWizardSceneContent'
import { RouterDialog, RouterDialogStateProvider } from 'wbui/RouterDialog'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%',
    minWidth: 580
  }
}

@withStyles(styles)
class MailboxWizardScene extends React.Component {
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
  * @param evt: the event that fired
  */
  handleClose = (evt) => {
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
        <RouterDialogStateProvider routeName={routeName} Component={MailboxWizardSceneContent} />
      </RouterDialog>
    )
  }
}

export default MailboxWizardScene
