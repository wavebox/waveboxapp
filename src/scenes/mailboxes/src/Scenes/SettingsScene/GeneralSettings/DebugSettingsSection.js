import PropTypes from 'prop-types'
import React from 'react'
import { settingsActions } from 'stores/settings'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import TimelineIcon from '@material-ui/icons/Timeline'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import BugReportIcon from '@material-ui/icons/BugReport'
import SettingsListItemButton from 'wbui/SettingsListItemButton'

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
    return (
      modelCompare(this.props.app, nextProps.app, ['writeMetricsLog']) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  render () {
    const { showRestart, app, classes, ...passProps } = this.props

    return (
      <SettingsListSection title='Debug' icon={<BugReportIcon />} {...passProps}>
        <SettingsListItemSwitch
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
        <SettingsListItemButton
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
