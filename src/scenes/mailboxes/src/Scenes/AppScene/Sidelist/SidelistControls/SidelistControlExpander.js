import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import blueGrey from '@material-ui/core/colors/blueGrey'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  icon: {
    color: blueGrey[400],
    '&:hover': {
      color: blueGrey[200]
    }
  }
}

@withStyles(styles)
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
          <KeyboardArrowDownIcon className={classes.icon} />
        ) : (
          <KeyboardArrowUpIcon className={classes.icon} />
        )} />
    )
  }
}

export default SidelistControlExpander
