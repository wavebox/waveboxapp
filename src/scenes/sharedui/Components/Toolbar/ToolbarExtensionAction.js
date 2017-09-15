import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ReactPortalTooltip from 'react-portal-tooltip'
import { basicPopoverStyles } from './ToolbarPopoverStyles'
import uuid from 'uuid'

const styles = {
  button: {
    position: 'relative',
    cursor: 'pointer'
  },
  icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -9,
    marginLeft: -9,
    width: 18,
    height: 18,
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat'
  }
}

export default class ToolbarExtensionAction extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    toolbarHeight: PropTypes.number.isRequired,
    extensionId: PropTypes.string.isRequired,
    tabId: PropTypes.number,
    onIconClicked: PropTypes.func.isRequired,
    enabled: PropTypes.bool.isRequired,
    icon: PropTypes.object.isRequired,
    title: PropTypes.string
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.instanceId = uuid.v4()
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    isHovering: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the icon being clicked
  * @param evt: the event that fired
  */
  onIconClicked = (evt) => {
    const { enabled, tabId, extensionId, onIconClicked } = this.props
    if (!enabled || !tabId) { return }
    onIconClicked(evt, extensionId, tabId)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * @param icon: the icon information
  * @return a url to the icon image
  */
  getIconUrl (icon) {
    if (!icon) { return undefined }
    if (icon.path) {
      const sizes = Object.keys(icon.path)
        .map((size) => parseInt(size))
        .filter((size) => !isNaN(size))
      const size = `${Math.max(...sizes)}`
      return icon.path[size]
    }
    return undefined
  }

  render () {
    const {
      toolbarHeight,
      extensionId,
      tabId,
      onIconClicked,
      enabled,
      icon,
      title,
      style,
      ...passProps
    } = this.props
    const {
      isHovering
    } = this.state

    const elementId = `ReactComponent-ToolbarExtensionAction-${this.instanceId}`
    const iconUrl = this.getIconUrl(icon)
    return (
      <div
        {...passProps}
        style={{
          width: toolbarHeight,
          height: toolbarHeight,
          ...styles.button,
          ...style
        }}
        id={elementId}
        onClick={this.onIconClicked}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}>
        <div style={{
          ...styles.icon,
          backgroundImage: iconUrl ? `url("${iconUrl}")` : undefined,
          filter: enabled ? 'none' : 'grayscale(100%)'
        }} />
        {title ? (
          <ReactPortalTooltip
            active={isHovering}
            tooltipTimeout={0}
            style={basicPopoverStyles}
            position='bottom'
            arrow='top'
            group={elementId}
            parent={`#${elementId}`}>
            <span style={styles.tooltipContent}>
              {title}
            </span>
          </ReactPortalTooltip>
        ) : undefined}
      </div>
    )
  }
}
