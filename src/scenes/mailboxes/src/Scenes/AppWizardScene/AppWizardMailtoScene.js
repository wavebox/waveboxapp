import React from 'react'
import PropTypes from 'prop-types'
import { platformActions } from 'stores/platform'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton } from 'material-ui'

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

export default class AppWizardMailtoScene extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static PropTypes = {
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
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Default mail client</h2>
        <p style={styles.subHeading}>
          You can make Wavebox your default mail client so that it launches
          when you start to compose a new e-mail
        </p>
        <RaisedButton
          label='Make Wavebox the default mail client'
          primary
          onClick={this.handleMakeDefaultClient} />
      </div>
    )
  }
}
