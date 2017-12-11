import React from 'react'
import PropTypes from 'prop-types'
import { RaisedButton } from 'material-ui'

const styles = {
  container: {
    cursor: 'pointer',
    display: 'inline-block'
  },
  containerDisabled: {
    cursor: 'default'
  },
  logoContainer: {
    position: 'relative',
    margin: '0px auto'
  },
  logo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  logoDisabled: {
    filter: 'grayscale(100%)'
  },
  logoBackdrop: {
    filter: 'blur(3px)'
  },
  button: {
    marginTop: 8,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 0,
    display: 'inline-block'
  }
}

export default class MailboxWizardAccountButton extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  static propTypes = {
    buttonText: PropTypes.string.isRequired,
    tooltipText: PropTypes.string,
    logoPath: PropTypes.string.isRequired,
    logoSize: PropTypes.number.isRequired,
    disabled: PropTypes.bool.isRequired
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = {
    hovering: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      logoSize,
      buttonText,
      logoPath,
      disabled,
      onClick,
      style,
      ...passProps
    } = this.props
    const { hovering } = this.state

    return (
      <div
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
        style={{
          ...styles.container,
          ...(disabled ? styles.containerDisabled : undefined),
          ...style
        }}
        {...passProps}>
        <div
          onClick={disabled ? undefined : onClick}
          style={{
            width: logoSize,
            height: logoSize,
            ...styles.logoContainer
          }}>
          {disabled ? undefined : (
            <img
              src={logoPath}
              style={{
                width: logoSize,
                height: logoSize,
                display: hovering ? 'block' : 'none',
                ...styles.logo,
                ...styles.logoBackdrop
              }} />
          )}
          <img
            src={logoPath}
            style={{
              width: logoSize,
              height: logoSize,
              ...styles.logo,
              ...(disabled ? styles.logoDisabled : undefined)
            }} />
        </div>
        <RaisedButton
          style={styles.button}
          label={buttonText}
          primary
          disabled={disabled}
          onClick={onClick} />
      </div>
    )
  }
}
