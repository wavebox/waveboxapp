import React from 'react'
import { FontIcon, Avatar } from 'material-ui' //TODO
import * as Colors from 'material-ui/styles/colors' //TODO

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

export default class AppWizardIntroScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    //
    return (
      <div style={styles.container}>
        <Avatar
          color={Colors.yellow600}
          backgroundColor={Colors.blueGrey900}
          icon={(<FontIcon className='fas fa-fw fa-magic' />)}
          size={100} />
        <h2 style={styles.heading}>
          Wavebox Setup Wizard
        </h2>
        <p style={styles.subHeading}>
          Take a few moments to customise some of the common Wavebox settings so it works best for you
        </p>
      </div>
    )
  }
}
