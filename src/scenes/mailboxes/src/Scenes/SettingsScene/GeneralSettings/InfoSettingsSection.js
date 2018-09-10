import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { userStore } from 'stores/user'
import { RELEASE_CHANNELS } from 'shared/constants'
import pkg from 'package.json'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemText from 'wbui/SettingsListItemText'
import HelpIcon from '@material-ui/icons/Help'

export default class InfoSettingsSection extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const wireConfigVersion = userStore.getState().wireConfigVersion()
    return (
      <SettingsListSection icon={<HelpIcon />} title='About' {...this.props}>
        {pkg.earlyBuildId ? (
          <SettingsListItemText
            primary={'Early Build Reference'}
            secondary={pkg.earlyBuildId} />
        ) : undefined}
        {wireConfigVersion ? (
          <SettingsListItemText
            primary={'Wire Config Version'}
            secondary={wireConfigVersion} />
        ) : undefined}
        <SettingsListItemText
          divider={false}
          primary={'Version'}
          secondary={`${pkg.version}${pkg.releaseChannel === RELEASE_CHANNELS.BETA ? 'beta' : ''}`} />
      </SettingsListSection>
    )
  }
}
