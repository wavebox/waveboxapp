import React from 'react'
import PropTypes from 'prop-types'
import { IconButton } from 'material-ui'
import ReactPortalTooltip from 'react-portal-tooltip'
import uuid from 'uuid'

const styles = {
  container: {
    textAlign: 'center'
  },
  icon: {
    WebkitAppRegion: 'no-drag'
  },
  popover: {
    style: {
      background: 'rgba(34, 34, 34, 0.9)',
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: '13px',
      color: 'white'
    },
    arrowStyle: {
      color: 'rgba(34, 34, 34, 0.9)',
      borderColor: false
    }
  }
}

export default class SidelistControl extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.element.isRequired,
    iconStyle: PropTypes.object,
    tooltip: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      generatedId: uuid.v4(),
      showTooltip: false
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * Renders the app
  */
  render () {
    const { style, onClick, icon, iconStyle, tooltip, ...passProps } = this.props
    const { generatedId, showTooltip } = this.state

    return (
      <div
        {...passProps}
        style={{...styles.container, ...style}}
        onMouseEnter={() => this.setState({ showTooltip: true })}
        onMouseLeave={() => this.setState({ showTooltip: false })}
        id={`ReactComponent-Sidelist-Control-${generatedId}`}>
        <IconButton iconStyle={{...styles.icon, ...iconStyle}} onClick={onClick}>
          {icon}
        </IconButton>
        <ReactPortalTooltip
          active={showTooltip}
          tooltipTimeout={0}
          style={styles.popover}
          position='right'
          arrow='left'
          group={generatedId}
          parent={`#ReactComponent-Sidelist-Control-${generatedId}`}>
          {tooltip}
        </ReactPortalTooltip>
      </div>
    )
  }
}
