import React from 'react'
import SidelistControl from '../SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { withStyles } from '@material-ui/core/styles'
import SidelistFAIcon from '../SidelistFAIcon'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FARMagicIcon from 'wbfa/FARMagic'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistControlWizardContextMenu from './SidelistControlWizardContextMenu'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.wizard.icon.color'),
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

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props

    return (
      <SidelistControl
        className={`WB-SidelistControlWizard`}
        onClick={() => { window.location.hash = '/app_wizard' }}
        onContextMenu={this.showContextMenu}
        tooltip='Setup Wizard'
        tourStep={TOUR_STEPS.APP_WIZARD}
        tourTooltip={(
          <div>
            Click here to configure some of the most<br />
            common Wavebox Settings with the Setup Wizard
          </div>
        )}
        icon={(<SidelistFAIcon className={classes.icon} IconClass={FARMagicIcon} />)}
        ContextMenuComponent={SidelistControlWizardContextMenu} />
    )
  }
}

export default SidelistControlWizard
