import PropTypes from 'prop-types'
import React from 'react'
import CoreServiceWebView from '../CoreServiceWebView'
import { accountDispatch } from 'stores/account'
import shallowCompare from 'react-addons-shallow-compare'
import {
  WB_IENGINE_OPEN_ITEM_,
  WB_IENGINE_COMPOSE_ITEM_
} from 'shared/ipcEvents'

export default class IEngineWebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Lifecylce
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.webviewRef = React.createRef()
  }

  /* **************************************************************************/
  // Component lifecylce
  /* **************************************************************************/

  componentDidMount () {
    accountDispatch.on('openItem', this.handleOpenItem)
    accountDispatch.on('composeItem', this.handleComposeMessage)
  }

  componentWillUnmount () {
    accountDispatch.removeListener('openItem', this.handleOpenItem)
    accountDispatch.removeListener('composeItem', this.handleComposeMessage)
  }

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles opening a new message
  * @param evt: the event that fired
  */
  handleOpenItem = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      this.webviewRef.current.sendOrQueueIfSleeping(`${WB_IENGINE_OPEN_ITEM_}${evt.serviceId}`, evt.data)
    }
  }

  /**
  * Handles composing a new message
  * @param evt: the event that fired
  */
  handleComposeMessage = (evt) => {
    if (evt.serviceId === this.props.serviceId) {
      this.webviewRef.current.sendOrQueueIfSleeping(`${WB_IENGINE_COMPOSE_ITEM_}${evt.serviceId}`, evt.data)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { mailboxId, serviceId } = this.props
    return (
      <CoreServiceWebView
        ref={this.webviewRef}
        mailboxId={mailboxId}
        serviceId={serviceId} />
    )
  }
}
