import PropTypes from 'prop-types'
import React from 'react'
import { Popover, Menu, MenuItem, Divider, FontIcon } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'

const ITEM_TYPES = Object.freeze({
  OPTIONS: 'OPTIONS',
  HOMEPAGE: 'HOMEPAGE',
  MANAGE: 'MANAGE'
})

export default class ToolbarExtensionActionContextMenu extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static get ITEM_TYPES () { return ITEM_TYPES }

  static propTypes = {
    open: PropTypes.bool.isRequired,
    anchor: PropTypes.any,
    onRequestClose: PropTypes.func.isRequired,

    name: PropTypes.string.isRequired,
    extensionId: PropTypes.string.isRequired,
    tabId: PropTypes.number,
    hasHomepageUrl: PropTypes.bool.isRequired,
    hasOptions: PropTypes.bool.isRequired,
    onItemSelected: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
  }

  componentWillReceiveProps (nextProps) {
    // Delayed render
    if (this.props.open !== nextProps.open) {
      if (nextProps.open) {
        clearTimeout(this.renderTO)
        this.setState({ rendering: true })
      } else {
        clearTimeout(this.renderTO)
        this.renderTO = setTimeout(() => {
          this.setState({ rendering: false })
        }, 500)
      }
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = { rendering: this.props.open }

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the popover
  * @param evtOrFn: the fired event or a function to call on closed
  */
  handleClosePopover = (evtOrFn) => {
    this.props.onRequestClose()
    if (typeof (evtOrFn) === 'function') {
      setTimeout(() => { evtOrFn() }, 300)
    }
  }

  /**
  * Opens the extension options
  */
  handleOpenOptions = () => {
    this.handleClosePopover(() => {
      this.props.onItemSelected(ITEM_TYPES.OPTIONS, this.props.extensionId, this.props.tabId)
    })
  }

  /**
  * Opens the manage extensions page
  */
  handleManageExtensions = () => {
    this.handleClosePopover(() => {
      this.props.onItemSelected(ITEM_TYPES.MANAGE, this.props.extensionId, this.props.tabId)
    })
  }

  /**
  * Opens the extensions homepage
  */
  handleOpenHomepage = () => {
    this.handleClosePopover(() => {
      this.props.onItemSelected(ITEM_TYPES.HOMEPAGE, this.props.extensionId, this.props.tabId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { rendering } = this.state
    if (!rendering) { return false }
    const {
      open,
      anchor,
      onRequestClose,
      name,
      hasHomepageUrl,
      hasOptions
    } = this.props

    return (
      <Popover
        open={open}
        anchorEl={anchor}
        anchorOrigin={{ horizontal: 'middle', vertical: 'center' }}
        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        onRequestClose={onRequestClose}>
        <Menu desktop onEscKeyDown={onRequestClose}>
          {hasHomepageUrl ? (
            <MenuItem
              primaryText={name}
              onClick={this.handleOpenHomepage} />
          ) : undefined}
          {hasHomepageUrl ? (
            <Divider />
          ) : undefined}
          {hasOptions ? (
            <MenuItem
              primaryText='Options'
              onClick={this.handleOpenOptions}
              leftIcon={<FontIcon className='material-icons'>settings_applications</FontIcon>} />
          ) : undefined}
          {hasOptions ? (
            <Divider />
          ) : undefined}
          <MenuItem
            primaryText='Manage Extensions'
            onClick={this.handleManageExtensions}
            leftIcon={<FontIcon className='material-icons'>extension</FontIcon>} />
        </Menu>
      </Popover>
    )
  }
}
