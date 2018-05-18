import React from 'react'
import { Icon, Avatar } from 'material-ui'
import blueGrey from 'material-ui/colors/blueGrey'
import yellow from 'material-ui/colors/yellow'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'

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
  },
  avatar: {
    backgroundColor: blueGrey[900],
    color: yellow[600],
    width: 100,
    height: 100
  },
  avatarIcon: {
    fontSize: '50px'
  }
}

@withStyles(styles)
class AppWizardIntroScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props

    return (
      <div className={classes.container}>
        <Avatar className={classes.avatar}>
          <Icon className={classNames(classes.avatarIcon, 'fas fa-fw fa-magic')} />
        </Avatar>
        <h2 className={classes.heading}>
          Wavebox Setup Wizard
        </h2>
        <p className={classes.subHeading}>
          Take a few moments to customise some of the common Wavebox settings so it works best for you
        </p>
      </div>
    )
  }
}

export default AppWizardIntroScene
