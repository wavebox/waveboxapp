import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import SettingsSharpIcon from '@material-ui/icons/SettingsSharp'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import SidelistMatIcon from './SidelistMatIcon'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.settings.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.settings.icon.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlSettings extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {classes} = this.props
    return (
      <SidelistControl
        className={`WB-SidelistControlSettings`}
        onClick={() => { window.location.hash = '/settings' }}
        tooltip='Settings'
        tourStep={TOUR_STEPS.SETTINGS}
        tourTooltip={(
          <div>
            Click here to open the Wavebox Settings and<br />
            make sure Wavebox works best for you
          </div>
        )}
        tourTooltipStyles={{
          style: { marginTop: -25 },
          arrowStyle: { marginTop: 20 }
        }}
        icon={(<SidelistMatIcon IconClass={SettingsSharpIcon} className={classes.icon} />)} />
    )
  }
}

export default SidelistControlSettings
