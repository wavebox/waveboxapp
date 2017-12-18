import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { TextField, Checkbox, Slider } from 'material-ui'

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

  // Sleep wait
  sleepWaitContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12
  },

  // Sleep wait
  sleepWaitText: {
    width: 50,
    marginRight: 6,
    marginTop: -18
  },
  sleepWaitTextSuffix: {
    lineHeight: '16.5px',
    fontSize: '12px',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)'
  },

  // Sleep slider
  sleepWaitSlider: {
    width: '100%',
    marginLeft: 0,
    marginRight: 12,
    height: 48
  },
  sleepWaitSliderSlider: {
    marginTop: 8
  }
}

const MIN_MILLIS = 0
const MAX_MILLIS = 600000

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
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.sleepWaitMs !== nextProps.sleepWaitMs) {
      this.setState({ intermediaryValue: `${this.humanizeMillis(nextProps.sleepWaitMs)}` })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      intermediaryValue: `${this.humanizeMillis(this.props.sleepWaitMs)}`
    }
  })()

  /**
  * @param millis: the millis to humanize
  * @return a nicer value
  */
  humanizeMillis (millis) {
    return Math.round(((millis / 1000) / 60) * 10) / 10
  }

  /**
  * @param val: the value to make safe for the slider
  * @return the safe value
  */
  intermediaryToSlider (val) {
    const valueInt = parseInt(this.state.intermediaryValue)
    if (isNaN(valueInt)) {
      return this.props.sleepWaitMs
    } else {
      const value = valueInt * 1000 * 60
      return Math.max(Math.min(value, MAX_MILLIS), MIN_MILLIS)
    }
  }

  /**
  * @param val: the value to convert from the slider
  * @return the value
  */
  sliderToIntermediary (val) {
    return `${val / 1000 / 60}`
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Finishes editing the sleep wait millis by converting to a safe number and emitting
  */
  finishEditingSleepWaitMs () {
    const valueInt = parseInt(this.state.intermediaryValue)
    if (isNaN(valueInt)) {
      this.setState({ intermediaryValue: `${this.humanizeMillis(this.props.sleepWaitMs)}` })
    } else {
      const value = valueInt * 1000 * 60
      if (value !== this.props.sleepWaitMs) {
        this.props.onSleepWaitMsChanged(value)
      }
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
      style,
      disabled,
      sleepEnabled,
      onSleepEnabledChanged,
      sleepWaitMs,
      onSleepWaitMsChanged,
      ...passProps
    } = this.props
    const {
      intermediaryValue
    } = this.state

    return (
      <div {...passProps} style={{...styles.sleepContainer, ...style}}>
        <label style={styles.sleepLabel}>
          Sleep tab after minutes of inactivity
        </label>
        <div style={styles.sleepActions}>
          <Checkbox
            style={styles.sleepToggle}
            disabled={disabled}
            checked={sleepEnabled}
            onCheck={(evt, toggled) => { onSleepEnabledChanged(toggled) }} />
          <div style={styles.sleepWaitContainer}>
            <Slider
              min={MIN_MILLIS}
              max={MAX_MILLIS}
              step={1000 * 30}
              style={styles.sleepWaitSlider}
              sliderStyle={styles.sleepWaitSliderSlider}
              disabled={disabled || !sleepEnabled}
              value={this.intermediaryToSlider(intermediaryValue)}
              onChange={(evt, val) => { this.setState({ intermediaryValue: this.sliderToIntermediary(val) }) }}
              onDragStop={() => { this.finishEditingSleepWaitMs() }} />
            <TextField
              style={styles.sleepWaitText}
              inputStyle={{ textAlign: 'right' }}
              hintStyle={{ textAlign: 'right' }}
              hintText='1.5'
              disabled={disabled || !sleepEnabled}
              value={intermediaryValue}
              type='number'
              min='0'
              step='0.5'
              onChange={(evt) => { this.setState({ intermediaryValue: evt.target.value }) }}
              onBlur={(evt) => { this.finishEditingSleepWaitMs() }}
            />
            <div style={styles.sleepWaitTextSuffix}>Minutes</div>
          </div>
        </div>
      </div>
    )
  }
}
