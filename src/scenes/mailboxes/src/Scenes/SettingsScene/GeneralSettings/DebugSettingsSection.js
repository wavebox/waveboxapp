import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListSwitch from 'wbui/SettingsListSwitch'
import TimelineIcon from '@material-ui/icons/Timeline'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import BugReportIcon from '@material-ui/icons/BugReport'
import SettingsListButton from 'wbui/SettingsListButton'

const styles = {
  link: {
    color: blue[600],
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class DebugSettingsSection extends React.Component {
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
      <SettingsListSection title='Debug' icon={<BugReportIcon />} {...passProps}>
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
        <SettingsListButton
          divider={false}
          label='Task Monitor'
          icon={<TimelineIcon />}
          onClick={() => {
            settingsActions.sub.app.openMetricsMonitor()
          }} />
      </SettingsListSection>
    )
  }
}

export default DebugSettingsSection
