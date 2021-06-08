import PropTypes from 'prop-types'
import React from 'react'
import { accountActions, accountStore } from 'stores/account'
import { withStyles } from '@material-ui/core/styles'
import shallowCompare from 'react-addons-shallow-compare'
import DoneIcon from '@material-ui/icons/Done'
import ServiceInfoPanelActionButton from 'wbui/ServiceInfoPanelActionButton'
import ServiceInfoPanelActions from 'wbui/ServiceInfoPanelActions'
import ServiceInfoPanelBody from 'wbui/ServiceInfoPanelBody'
import ServiceInfoPanelContent from 'wbui/ServiceInfoPanelContent'
import ServiceReducer from 'shared/AltStores/Account/ServiceReducers/ServiceReducer'
import ReactMarkdown from 'react-markdown'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  markdown: {
    '& img': {
      maxWidth: '100%'
    }
  },
  buttonIcon: {
    marginRight: 6
  }
}

class Link extends React.Component {
  render () {
    const { href, children, ...passProps } = this.props
    return (
      <a
        {...passProps}
        href='#'
        onClick={() => WBRPCRenderer.wavebox.openExternal(href)}>
        {children}
      </a>
    )
  }
}

@withStyles(styles)
class ServiceInstallInfo extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired
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
      this.setState({
        ...this.deriveServiceInfo(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.deriveServiceInfo(this.props.serviceId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState({
      ...this.deriveServiceInfo(this.props.serviceId, accountState)
    })
  }

  /**
  * Gets the service info from the account state
  * @param serviceId: the id of the service
  * @param accountState: the current account state
  * @return a state update object
  */
  deriveServiceInfo (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return {
      installText: service ? service.installText : ''
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles a link being clicked
  */
  handleLinkClick = (url, text, title) => {
    WBRPCRenderer.wavebox.openExternal(url)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      serviceId,
      classes,
      ...passProps
    } = this.props
    const {
      installText
    } = this.state

    return (
      <ServiceInfoPanelContent {...passProps}>
        <ServiceInfoPanelBody actions={1}>
          <ReactMarkdown
            className={classes.markdown}
            source={installText}
            skipHtml
            renderers={{
              link: Link,
              linkReference: Link
            }} />
        </ServiceInfoPanelBody>
        <ServiceInfoPanelActions actions={1}>
          <ServiceInfoPanelActionButton
            color='primary'
            variant='contained'
            onClick={() => {
              accountActions.reduceService(serviceId, ServiceReducer.setHasSeenInstallInfo, true)
            }}>
            <DoneIcon className={classes.buttonIcon} />
            Done
          </ServiceInfoPanelActionButton>
        </ServiceInfoPanelActions>
      </ServiceInfoPanelContent>
    )
  }
}

export default ServiceInstallInfo
