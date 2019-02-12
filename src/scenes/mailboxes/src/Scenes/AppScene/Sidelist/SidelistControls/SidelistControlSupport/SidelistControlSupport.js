import React from 'react'
import SidelistControl from '../SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import SidelistFAIcon from '../SidelistFAIcon'
import FARQuestionCircleIcon from 'wbfa/FARQuestionCircle'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistControlSupportContextMenu from './SidelistControlSupportContextMenu'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.support.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.support.icon.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlSupport extends React.Component {
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
        className={`WB-SidelistControlSupport`}
        onClick={() => { window.location.hash = '/settings/support' }}
        tooltip={`Help, Support & FAQs`}
        tourStep={TOUR_STEPS.SUPPORT_CENTER}
        onContextMenu={this.showContextMenu}
        tourTooltip={(
          <div>
            Click here to get support, find answers to<br />
            the most commonly asked questions and get<br />
            involved with the Wavebox community
          </div>
        )}
        icon={(<SidelistFAIcon className={classes.icon} IconClass={FARQuestionCircleIcon} />)}
        ContextMenuComponent={SidelistControlSupportContextMenu} />
    )
  }
}

export default SidelistControlSupport
