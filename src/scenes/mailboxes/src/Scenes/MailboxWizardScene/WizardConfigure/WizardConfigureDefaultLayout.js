import React from 'react'
import { Button } from 'material-ui'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'

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
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
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

@withStyles(styles)
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
      children,
      mailboxId,
      className,
      classes,
      ...passProps
    } = this.props

    return (
      <div {...passProps} className={classNames(classes.container, className)}>
        <div className={classes.body}>
          {children}
        </div>
        <div className={classes.footer}>
          {buttons || (
            <div>
              <Button
                className={classes.settingsButton}
                onClick={() => {
                  window.location.hash = `/settings/accounts/${mailboxId}`
                }}>
                Account Settings
              </Button>
              <Button color='primary' variant='raised' onClick={onRequestCancel}>
                Finish
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
}
