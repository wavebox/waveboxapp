import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAttachWizardSceneContent from './ServiceAttachWizardSceneContent'
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
class ServiceAttachWizardScene extends React.Component {
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
        disableRestoreFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <RouterDialogStateProvider routeName={routeName} Component={ServiceAttachWizardSceneContent} />
      </RouterDialog>
    )
  }
}

export default ServiceAttachWizardScene
