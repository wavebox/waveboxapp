import PropTypes from 'prop-types'
import React from 'react'
import settingsActions from 'stores/settings/settingsActions'
import modelCompare from 'wbui/react-addons-model-compare'
import partialShallowCompare from 'wbui/react-addons-partial-shallow-compare'
import { OSSettings } from 'shared/Models/Settings'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSwitch from 'wbui/SettingsListItemSwitch'
import SettingsListItemSelectInline from 'wbui/SettingsListItemSelectInline'
import LinkIcon from '@material-ui/icons/Link'

const LINK_OPEN_OPTIONS = [
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.DEFAULT, label: 'Default Behaviour' },
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.BROWSER_OPEN, label: 'Open in Default Browser' },
  { value: OSSettings.COMMAND_LINK_BEHAVIOUR.WAVEBOX_OPEN, label: 'Open in Wavebox Window' }
]

export default class LinkSettingsSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    os: PropTypes.object.isRequired,
    showRestart: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return (
      modelCompare(this.props.os, nextProps.os, [
        'openLinksInBackground',
        'linkBehaviourWithShift',
        'linkBehaviourWithCmdOrCtrl'
      ]) ||
      partialShallowCompare(
        { showRestart: this.props.showRestart },
        this.state,
        { showRestart: nextProps.showRestart },
        nextState
      )
    )
  }

  render () {
    const {
      os,
      showRestart,
      ...passProps
    } = this.props

    return (
      <SettingsListSection title='Links' icon={<LinkIcon />} {...passProps}>
        {process.platform === 'darwin' ? (
          <SettingsListItemSwitch
            label='Open links in background'
            onChange={(evt, toggled) => settingsActions.sub.os.setOpenLinksInBackground(toggled)}
            checked={os.openLinksInBackground} />
        ) : undefined}
        <SettingsListItemSelectInline
          label={`${process.platform === 'darwin' ? '⌘ Command' : '⌃ Control'}+Click link behaviour`}
          value={os.linkBehaviourWithCmdOrCtrl}
          options={LINK_OPEN_OPTIONS}
          onChange={(evt, value) => settingsActions.sub.os.setLinkBehaviourWithCmdOrCtrl(value)} />
        <SettingsListItemSelectInline
          divider={false}
          label='⇧ Shift+Click link behaviour'
          value={os.linkBehaviourWithShift}
          options={LINK_OPEN_OPTIONS}
          onChange={(evt, value) => settingsActions.sub.os.setLinkBehaviourWithShift(value)} />
      </SettingsListSection>
    )
  }
}
