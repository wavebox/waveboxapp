import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import SidelistMatIcon from './SidelistMatIcon'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.expander.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.expander.icon.color', 'hover')
    }
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlExpander extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { classes, expanded, onClick } = this.props
    return (
      <SidelistControl
        className={`WB-SidelistControlExpander`}
        onClick={onClick}
        tooltip={expanded ? 'Hide' : 'Show'}
        tourStep={TOUR_STEPS.EXPANDER}
        tourTooltip={(
          <div>
            Click here to hide/show the controls.
          </div>
        )}
        tourTooltipStyles={{
          style: { marginTop: -25 },
          arrowStyle: { marginTop: 20 }
        }}
        icon={expanded ? (
          <SidelistMatIcon IconClass={KeyboardArrowDownIcon} className={classes.icon} />
        ) : (
          <SidelistMatIcon IconClass={KeyboardArrowUpIcon} className={classes.icon} />
        )} />
    )
  }
}

export default SidelistControlExpander
