import React from 'react'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import blueGrey from '@material-ui/core/colors/blueGrey'
import SettingsIcon from '@material-ui/icons/Settings'
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
        icon={(<SettingsIcon className={classes.icon} />)} />
    )
  }
}

export default SidelistControlSettings
