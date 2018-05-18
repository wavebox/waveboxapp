import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'material-ui'
import { settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import TimelineIcon from '@material-ui/icons/Timeline'
import SettingsListItem from 'wbui/SettingsListItem'
import { withStyles } from 'material-ui/styles'
import blue from 'material-ui/colors/blue'

const styles = {
  buttonIcon: {
    marginRight: 6,
    height: 18,
    width: 18
  },
  link: {
    color: blue[600],
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}

@withStyles(styles)
export default class DebugSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    showRestart: PropTypes.func.isRequired,
    app: PropTypes.object.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { showRestart, app, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Debug' {...passProps}>
        <SettingsListSwitch
          label={(
            <span>
              Write app merics log
              &nbsp;
              <a
                href='#'
                className={classes.link}
                onClick={(evt) => {
                  evt.preventDefault()
                  settingsActions.sub.app.openMetricsLog()
                }}>
                (Open log)
              </a>
            </span>
          )}
          onChange={(evt, toggled) => { settingsActions.sub.app.setWriteMetricsLog(toggled) }}
          checked={app.writeMetricsLog} />
        <SettingsListItem divider={false}>
          <Button variant='raised' size='small' onClick={() => settingsActions.sub.app.openMetricsMonitor()}>
            <TimelineIcon className={classes.buttonIcon} />
            Task Monitor'
          </Button>
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}
