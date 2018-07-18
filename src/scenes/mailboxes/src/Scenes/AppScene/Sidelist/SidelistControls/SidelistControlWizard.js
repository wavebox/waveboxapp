import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { withStyles } from '@material-ui/core/styles'
import FAIcon from 'wbfa/FAIcon'
import ThemeTools from 'wbui/Themes/ThemeTools'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.wizard.icon.color'),
    fontSize: '24px',
    marginLeft: -3,
    height: 48,
    width: 48,
    lineHeight: '48px',
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.wizard.icon.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlWizard extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {classes} = this.props
    return (
      <SidelistControl
        className={`WB-SidelistControlWizard`}
        onClick={() => { window.location.hash = '/app_wizard' }}
        tooltip='Setup Wizard'
        tourStep={TOUR_STEPS.APP_WIZARD}
        tourTooltip={(
          <div>
            Click here to configure some of the most<br />
            common Wavebox Settings with the Setup Wizard
          </div>
        )}
        icon={(<FAIcon className={classes.icon} icon='farMagic' />)} />
    )
  }
}

export default SidelistControlWizard
