import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { RouterDialog } from 'wbui/RouterDialog'
import ProSceneContent from './ProSceneContent'

const styles = {
  root: {
    maxWidth: '100%',
    width: '100%',
    height: '100%'
  }
}

@withStyles(styles)
class ProScene extends React.Component {
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
    const { classes, routeName } = this.props

    return (
      <RouterDialog
        routeName={routeName}
        disableEnforceFocus
        disableRestoreFocus
        onClose={this.handleClose}
        classes={{ paper: classes.root }}>
        <ProSceneContent />
      </RouterDialog>
    )
  }
}

export default ProScene
