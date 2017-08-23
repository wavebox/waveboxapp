import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { TextField, Checkbox } from 'material-ui'

const styles = {
  // Sleep
  sleepLabel: {
    lineHeight: '16.5px',
    fontSize: '12px',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)'
  },
  sleepActions: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: -10,
    marginBottom: 4,
    alignItems: 'center'
  },
  sleepToggle: {
    width: 40
  },
  sleepWaitContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  sleepWait: {
    width: '100%'
  },
  sleepWaitSuffix: {
    lineHeight: '16.5px',
    fontSize: '12px',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)'
  }
}

export default class SleepableField extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    sleepEnabled: PropTypes.bool.isRequired,
    onSleepEnabledChanged: PropTypes.func.isRequired,
    sleepWaitMs: PropTypes.number.isRequired,
    onSleepWaitMsChanged: PropTypes.func.isRequired
  }

  static defaultProps = {
    disabled: false
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      style,
      disabled,
      sleepEnabled,
      onSleepEnabledChanged,
      sleepWaitMs,
      onSleepWaitMsChanged,
      ...passProps } = this.props

    return (
      <div {...passProps} style={{...styles.sleepContainer, ...style}}>
        <label style={styles.sleepLabel}>
          Sleep tab after seconds of inactivity
        </label>
        <div style={styles.sleepActions}>
          <Checkbox
            style={styles.sleepToggle}
            disabled={disabled}
            checked={sleepEnabled}
            onCheck={(evt, toggled) => { onSleepEnabledChanged(toggled) }} />
          <div style={styles.sleepWaitContainer}>
            <TextField
              style={styles.sleepWait}
              hintText='30'
              disabled={disabled || !sleepEnabled}
              defaultValue={sleepWaitMs / 1000}
              type='number'
              min='0'
              step='1'
              max='6000'
              onBlur={(evt) => {
                const value = parseInt(evt.target.value) * 1000
                onSleepWaitMsChanged(value)
              }}
            />
            <div style={styles.sleepWaitSuffix}>Seconds</div>
          </div>
        </div>
      </div>
    )
  }
}
