import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { accountStore } from 'stores/account'
import CommandPaletteSearchItem from './CommandPaletteSearchItem'
import CommandPaletteSearchEngine from './CommandPaletteSearchEngine'

class CommandPaletteSearchItemService extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    onOpenItem: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountUpdated)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountUpdated)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState(
        this.generateServiceState(nextProps.serviceId, accountStore.getState())
      )
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.generateServiceState(this.props.serviceId, accountStore.getState())
    }
  })()

  accountUpdated = (accountState) => {
    this.setState(
      this.generateServiceState(this.props.serviceId, accountState)
    )
  }

  generateServiceState (serviceId, accountState) {
    return {
      primaryText: accountState.resolvedServiceDisplayName(serviceId)
    }
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { serviceId, onOpenItem, onClick } = this.props
    onOpenItem(evt, CommandPaletteSearchEngine.SEARCH_TARGETS.SERVICE, serviceId)
    if (onClick) {
      onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      primaryText
    } = this.state
    const {
      serviceId,
      onOpenItem,
      onClick,
      ...passProps
    } = this.props

    return (
      <CommandPaletteSearchItem
        onClick={this.handleClick}
        primaryText={primaryText}
        secondaryText='SERVICE'
        {...passProps} />
    )
  }
}

export default CommandPaletteSearchItemService
