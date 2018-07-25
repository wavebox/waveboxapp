import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import SidelistFAIcon from './SidelistFAIcon'
import FARQuestionCircleIcon from 'wbfa/FARQuestionCircle'

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

  render () {
    const {classes} = this.props
    return (
      <SidelistControl
        className={`WB-SidelistControlSupport`}
        onClick={() => { window.location.hash = '/settings/support' }}
        tooltip={`Help, Support & FAQs`}
        tourStep={TOUR_STEPS.SUPPORT_CENTER}
        tourTooltip={(
          <div>
            Click here to get support, find answers to<br />
            the most commonly asked questions and get<br />
            involved with the Wavebox community
          </div>
        )}
        icon={(
          <SidelistFAIcon className={classes.icon} IconClass={FARQuestionCircleIcon} />
        )} />
    )
  }
}

export default SidelistControlSupport
