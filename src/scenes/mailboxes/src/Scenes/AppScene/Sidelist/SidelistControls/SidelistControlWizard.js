import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { withStyles } from '@material-ui/core/styles'
import SidelistFAIcon from './SidelistFAIcon'
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FARMagicIcon from 'wbfa/FARMagic'
import shallowCompare from 'react-addons-shallow-compare'
import { settingsActions } from 'stores/settings'
import FAREyeSlashIcon from 'wbfa/FAREyeSlash'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.wizard.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.wizard.icon.color', 'hover')
    }
  },
  contextMenuFAWrap: {
    width: 24,
    height: 24,
    fontSize: 24
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

  /**
  * Renders the context menu
  * @param onRequestClose: a call which can close the context menu
  * @return array
  */
  renderContextMenu = (onRequestClose) => {
    const { classes } = this.props
    return [
      (<MenuItem
        key='hide'
        onClick={(evt) => {
          onRequestClose(evt, () => { settingsActions.sub.app.setHasSeenAppWizard(true) })
        }}>
        <ListItemIcon>
          <span className={classes.contextMenuFAWrap}>
            <FAREyeSlashIcon />
          </span>
        </ListItemIcon>
        <ListItemText inset primary='Hide Setup Wizard' />
      </MenuItem>)
    ]
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
        contextMenuRenderer={this.renderContextMenu} />
    )
  }
}

export default SidelistControlWizard
