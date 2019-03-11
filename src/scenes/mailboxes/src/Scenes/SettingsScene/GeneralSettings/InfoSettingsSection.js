import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { userStore } from 'stores/user'
import {
  RELEASE_CHANNELS,
  GITHUB_RELEASES_URL
} from 'shared/constants'
import pkg from 'package.json'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemText from 'wbui/SettingsListItemText'
import HelpIcon from '@material-ui/icons/Help'
import DistributionConfig from 'Runtime/DistributionConfig'
import { withStyles } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import WBRPCRenderer from 'shared/WBRPCRenderer'

const styles = {
  link: {
    color: blue[600],
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}

@withStyles(styles)
class InfoSettingsSection extends React.Component {
  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  _handleOpenReleasePage = () => {
    WBRPCRenderer.wavebox.openExternal(`${GITHUB_RELEASES_URL}v${pkg.version}`)
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, ...passProps } = this.props
    const wireConfigVersion = userStore.getState().wireConfigVersion()
    return (
      <SettingsListSection icon={<HelpIcon />} title='About' {...passProps}>
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
          primary={'Version'}
          secondary={(
            <React.Fragment>
              {`${pkg.version}${pkg.releaseChannel === RELEASE_CHANNELS.BETA ? 'beta' : ''}`}
              &nbsp;
              <span className={classes.link} onClick={this._handleOpenReleasePage} >
                See what's new in this release
              </span>
            </React.Fragment>
          )} />
        <SettingsListItemText
          divider={false}
          primary={'Install method'}
          secondary={DistributionConfig.installMethod || 'Unknown'} />
      </SettingsListSection>
    )
  }
}

export default InfoSettingsSection
