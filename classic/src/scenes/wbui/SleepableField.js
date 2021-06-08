import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { FormControl, Input, InputLabel, InputAdornment, Checkbox, Grid } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  gridContainer: {
    marginTop: 10
  },
  checkboxGridItem: {
    height: 56
  },
  numberGridItem: {
    height: 56,
    flex: 1
  },
  checkbox: {
    width: 20
  },
  numberInput: {
    marginTop: 8
  }
}

@withStyles(styles)
class SleepableField extends React.Component {
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

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Finishes editing the sleep wait millis by converting to a safe number and emitting
  */
  finishEditingSleepWaitMs () {
    const valueFloat = parseFloat(this.state.intermediaryValue)
    if (isNaN(valueFloat)) {
      this.setState({ intermediaryValue: `${this.humanizeMillis(this.props.sleepWaitMs)}` })
    } else {
      const value = valueFloat * 1000 * 60
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
      disabled,
      sleepEnabled,
      onSleepEnabledChanged,
      sleepWaitMs,
      onSleepWaitMsChanged,
      classes,
      ...passProps
    } = this.props
    const {
      intermediaryValue
    } = this.state

    return (
      <FormControl {...passProps}>
        <InputLabel>Sleep tab after minutes of inactivity</InputLabel>
        <Grid className={classes.gridContainer} container spacing={8} alignItems='flex-end'>
          <Grid className={classes.checkboxGridItem} item>
            <Checkbox
              className={classes.checkbox}
              color='primary'
              disabled={disabled}
              checked={sleepEnabled}
              onChange={(evt, toggled) => { onSleepEnabledChanged(toggled) }} />
          </Grid>
          <Grid className={classes.numberGridItem} item>
            <Input
              className={classes.numberInput}
              type='number'
              min='0'
              step='0.5'
              placeholder='1.5'
              fullWidth
              disabled={disabled || !sleepEnabled}
              value={intermediaryValue}
              onChange={(evt) => { this.setState({ intermediaryValue: evt.target.value }) }}
              onBlur={(evt) => { this.finishEditingSleepWaitMs() }}
              endAdornment={<InputAdornment position='end'>minutes</InputAdornment>}
            />
          </Grid>
        </Grid>
      </FormControl>
    )
  }
}

export default SleepableField
