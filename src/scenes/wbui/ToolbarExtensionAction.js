import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'
import { CR_EXTENSION_PROTOCOL } from 'shared/extensionApis'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import DefaultTooltip200w from 'wbui/Tooltips/DefaultTooltip200w'

const styles = {
  button: {
    position: 'relative',
    cursor: 'pointer'
  },
  icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -10,
    marginLeft: -10,
    width: 19,
    height: 19,
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat'
  }
}

@withStyles(styles)
class ToolbarExtensionAction extends React.Component {
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
    iconFilter: PropTypes.string,
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
  * @param extensionId: the id of the extension
  * @param icon: the icon information
  * @return a url to the icon image
  */
  getIconUrl (extensionId, icon) {
    if (!icon) { return undefined }
    if (icon.path) {
      const sizes = Object.keys(icon.path)
        .map((size) => parseInt(size))
        .filter((size) => !isNaN(size))
      const size = `${Math.max(...sizes)}`
      const rawIcon = icon.path[size]
      if (rawIcon.startsWith('data:')) {
        return rawIcon
      } else if (rawIcon.startsWith(`${CR_EXTENSION_PROTOCOL}:`)) {
        return rawIcon
      } else {
        return `${CR_EXTENSION_PROTOCOL}://${extensionId}/${rawIcon}`
      }
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
      iconFilter,
      title,
      style,
      classes,
      className,
      ...passProps
    } = this.props
    const {
      isHovering
    } = this.state

    const cssFilter = [
      iconFilter,
      enabled ? undefined : 'grayscale(100%)'
    ].filter((f) => !!f).join(' ') || 'none'

    const elementId = `ReactComponent-ToolbarExtensionAction-${this.instanceId}`
    const iconUrl = this.getIconUrl(extensionId, icon)
    return (
      <div
        {...passProps}
        className={classNames(classes.button, className)}
        style={{
          width: toolbarHeight,
          height: toolbarHeight,
          ...style
        }}
        id={elementId}
        onClick={this.onIconClicked}
        onMouseEnter={() => this.setState({ isHovering: true })}
        onMouseLeave={() => this.setState({ isHovering: false })}>
        <div
          className={classes.icon}
          style={{
            backgroundImage: iconUrl ? `url("${iconUrl}")` : undefined,
            filter: cssFilter
          }} />
        {title ? (
          <DefaultTooltip200w
            active={isHovering}
            tooltipTimeout={0}
            position='bottom'
            arrow='center'
            group={elementId}
            parent={`#${elementId}`}>
            <span className={classes.tooltipContent}>
              {title}
            </span>
          </DefaultTooltip200w>
        ) : undefined}
      </div>
    )
  }
}

export default ToolbarExtensionAction
