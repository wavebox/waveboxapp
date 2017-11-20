import React from 'react'
import { FontIcon, Avatar } from 'material-ui'
import * as Colors from 'material-ui/styles/colors'

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

export default class OptimizeWizardIntroScene extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    //
    return (
      <div style={styles.container}>
        <Avatar
          color='white'
          backgroundColor={Colors.blue600}
          icon={(<FontIcon className='fa fa-fw fa-tachometer' />)}
          size={100} />
        <h2 style={styles.heading}>
          Optimize Wavebox
        </h2>
        <p style={styles.subHeading}>
          Take a few moments to make sure Wavebox is optimized for your machine
        </p>
      </div>
    )
  }
}
