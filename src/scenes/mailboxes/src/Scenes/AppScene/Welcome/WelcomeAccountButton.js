import React from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid'
import ReactPortalTooltip from 'react-portal-tooltip'

const styles = {
  container: {
    position: 'relative',
    cursor: 'pointer'
  },
  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  logoBackdrop: {
    filter: 'blur(3px)'
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

export default class WelcomeAccountButton extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  static propTypes = {
    tooltipText: PropTypes.string.isRequired,
    logoPath: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    hovering: false,
    generatedId: uuid.v4()
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { size, tooltipText, logoPath, style, ...passProps } = this.props
    const { hovering, generatedId } = this.state

    return (
      <div
        {...passProps}
        id={`ReactComponent-WelcomeAccountButton-${generatedId}`}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        style={{
          width: size,
          height: size,
          ...styles.container,
          ...style
        }}>
        <img
          src={logoPath}
          style={{
            width: size,
            height: size,
            display: hovering ? 'block' : 'none',
            ...styles.logo,
            ...styles.logoBackdrop
          }} />
        <img
          src={logoPath}
          style={{
            width: size,
            height: size,
            ...styles.logo
          }} />
        <ReactPortalTooltip
          active={hovering}
          tooltipTimeout={0}
          style={styles.popover}
          position='top'
          arrow='center'
          group={generatedId}
          parent={`#ReactComponent-WelcomeAccountButton-${generatedId}`}>
          {tooltipText}
        </ReactPortalTooltip>
      </div>
    )
  }
}
