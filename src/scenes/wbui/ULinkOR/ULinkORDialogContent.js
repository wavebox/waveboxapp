import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { DialogContent, Collapse } from '@material-ui/core'
import ULinkORPrimaryOptions from './ULinkORPrimaryOptions'
import ULinkORAccountOptions from './ULinkORAccountOptions'
import classNames from 'classnames'

const styles = {
  accountOptions: {
    marginTop: 16
  },
  dialogContent: {
    overflowY: 'hidden'
  }
}

@withStyles(styles)
class ULinkORDialogContent extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired,
    webContentsId: PropTypes.number.isRequired,
    serviceId: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired,
    onOpenInWaveboxWindow: PropTypes.func.isRequired,
    onOpenInSystemBrowser: PropTypes.func.isRequired,
    onOpenInService: PropTypes.func.isRequired,
    accountStore: PropTypes.object.isRequired,
    avatarResolver: PropTypes.func.isRequired,
    iconResolver: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    expandedPrimary: true
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  handleAccountsActive = () => {
    this.setState({ expandedPrimary: false })
  }

  handleAccountsInactive = () => {
    this.setState({ expandedPrimary: true })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      targetUrl,
      webContentsId,
      serviceId,
      onRequestClose,
      onOpenInWaveboxWindow,
      onOpenInSystemBrowser,
      onOpenInService,
      iconResolver,
      classes,
      accountStore,
      avatarResolver,
      className,
      ...passProps
    } = this.props
    const {
      expandedPrimary
    } = this.state

    return (
      <DialogContent className={classNames(classes.dialogContent, className)} {...passProps}>
        <Collapse in={expandedPrimary}>
          <ULinkORPrimaryOptions
            serviceId={serviceId}
            onOpenInWaveboxWindow={onOpenInWaveboxWindow}
            onOpenInSystemBrowser={onOpenInSystemBrowser}
            iconResolver={iconResolver} />
        </Collapse>
        <ULinkORAccountOptions
          className={classes.accountOptions}
          targetUrl={targetUrl}
          onActive={this.handleAccountsActive}
          onInactive={this.handleAccountsInactive}
          accountStore={accountStore}
          avatarResolver={avatarResolver}
          onOpenInService={onOpenInService} />
      </DialogContent>
    )
  }
}

export default ULinkORDialogContent
