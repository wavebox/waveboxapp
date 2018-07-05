import React from 'react'
import { Button } from '@material-ui/core'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import StyleMixins from 'wbui/Styles/StyleMixins'
import { accountStore } from 'stores/account'

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
class WizardConfigureDefaultLayout extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onRequestCancel: PropTypes.func.isRequired,
    serviceId: PropTypes.string.isRequired,
    buttons: PropTypes.element
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        mailboxId: (accountState.getService(nextProps.serviceId) || {}).parentId
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      mailboxId: (accountState.getService(this.props.serviceId) || {}).parentId
    }
  })()

  accountUpdated = (accountState) => {
    this.setState({
      mailboxId: (accountState.getService(this.props.serviceId) || {}).parentId
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      onRequestCancel,
      buttons,
      children,
      serviceId,
      className,
      classes,
      ...passProps
    } = this.props
    const { mailboxId } = this.state

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

export default WizardConfigureDefaultLayout
