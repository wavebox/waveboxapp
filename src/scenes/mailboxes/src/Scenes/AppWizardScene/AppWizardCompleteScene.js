import React from 'react'
import { Avatar } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import lightGreen from '@material-ui/core/colors/lightGreen'
import green from '@material-ui/core/colors/green'
import blueGrey from '@material-ui/core/colors/blueGrey'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasMagic from '@fortawesome/fontawesome-pro-solid/faMagic'
import fasCheckCircle from '@fortawesome/fontawesome-pro-solid/faCheckCircle'

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
    color: lightGreen[400],
    width: 100,
    height: 100
  },
  avatarIcon: {
    fontSize: '50px'
  },
  doneIcon: {
    color: green[600],
    marginRight: 6
  }
}

@withStyles(styles)
class AppWizardCompleteScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    return (
      <div className={classes.container}>
        <Avatar className={classes.avatar}>
          <FontAwesomeIcon className={classes.avatarIcon} icon={fasMagic} />
        </Avatar>
        <h2 className={classes.heading}>
          <FontAwesomeIcon className={classes.doneIcon} icon={fasCheckCircle} />
          All Done!
        </h2>
        <p className={classes.subHeading}>
          You can go to settings at any time to update your configuration
        </p>
      </div>
    )
  }
}

export default AppWizardCompleteScene
