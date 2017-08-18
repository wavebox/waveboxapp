import React from 'react'
import { RaisedButton, FlatButton } from 'material-ui'
import PropTypes from 'prop-types'

const styles = {
  // Layout
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  body: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 68,
    padding: 16,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    padding: 16,
    textAlign: 'right'
  },

  settingsButton: {
    marginRight: 8
  }
}

export default class WizardConfigure extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onRequestCancel: PropTypes.func.isRequired,
    mailboxId: PropTypes.string.isRequired,
    buttons: PropTypes.element
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      onRequestCancel,
      buttons,
      style,
      children,
      mailboxId,
      ...passProps
    } = this.props

    return (
      <div {...passProps} style={{...styles.container, ...style}}>
        <div style={styles.body} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
          {children}
        </div>
        <div style={styles.footer}>
          {buttons || (
            <div>
              <FlatButton
                style={styles.settingsButton}
                onTouchTap={() => {
                  window.location.hash = `/settings/accounts/${mailboxId}`
                }}
                label='Account Settings' />
              <RaisedButton
                primary
                onTouchTap={onRequestCancel}
                label='Finish' />
            </div>
          )}
        </div>
      </div>
    )
  }
}
