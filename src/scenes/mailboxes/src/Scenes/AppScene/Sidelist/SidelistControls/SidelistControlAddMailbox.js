import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import AddCircleIcon from '@material-ui/icons/AddCircle'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import SidelistMatIcon from './SidelistMatIcon'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.add.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.add.icon.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlAddMailbox extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes } = this.props
    return (
      <SidelistControl
        className={`WB-SidelistControlAddMailbox`}
        onClick={() => { window.location.hash = '/mailbox_wizard/add' }}
        tooltip='Add Account'
        tourStep={TOUR_STEPS.ADD_ACCOUNT}
        tourTooltip={(
          <div>
            Click here to add your next account and take<br />
            full advantage of everything Wavebox has to offer
          </div>
        )}
        icon={(<SidelistMatIcon IconClass={AddCircleIcon} className={classes.icon} />)} />
    )
  }
}

export default SidelistControlAddMailbox
