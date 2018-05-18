import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { userStore } from 'stores/user'
import { RELEASE_CHANNELS } from 'shared/constants'
import pkg from 'package.json'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItem from 'wbui/SettingsListItem'
import { ListItemText } from '@material-ui/core'

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
      <SettingsListSection title='About'>
        {pkg.earlyBuildId ? (
          <SettingsListItem>
            <ListItemText primary={'Early Build Reference'} secondary={pkg.earlyBuildId} />
          </SettingsListItem>
        ) : undefined}
        {wireConfigVersion ? (
          <SettingsListItem>
            <ListItemText primary={'Wire Config Version'} secondary={wireConfigVersion} />
          </SettingsListItem>
        ) : undefined}
        <SettingsListItem divider={false}>
          <ListItemText
            primary={'Version'}
            secondary={`${pkg.version}${pkg.releaseChannel === RELEASE_CHANNELS.BETA ? 'beta' : ''}`} />
        </SettingsListItem>
      </SettingsListSection>
    )
  }
}
