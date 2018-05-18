import React from 'react'
import PropTypes from 'prop-types'
import { platformActions } from 'stores/platform'
import shallowCompare from 'react-addons-shallow-compare'
import { Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    textAlign: 'center'
  },
  heading: {
    fontWeight: 300,
    marginTop: 20
  },
  subHeading: {
    fontWeight: 300,
    marginTop: 0,
    fontSize: 16
  }
}

@withStyles(styles)
class AppWizardMailtoScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onRequestNext: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleMakeDefaultClient = () => {
    platformActions.changeMailtoLinkHandler(true)
    this.props.onRequestNext()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    return (
      <div className={classes.container}>
        <h2 className={classes.heading}>Default mail client</h2>
        <p className={classes.subHeading}>
          You can make Wavebox your default mail client so that it launches
          when you start to compose a new e-mail
        </p>
        <Button variant='raised' color='primary' onClick={this.handleMakeDefaultClient}>
          Make Wavebox the default mail client
        </Button>
      </div>
    )
  }
}

export default AppWizardMailtoScene
