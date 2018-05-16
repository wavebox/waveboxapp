import React from 'react'
import { Icon } from 'material-ui'
import SidelistControl from './SidelistControl'
import { TOUR_STEPS } from 'stores/settings/Tour'
import amber from 'material-ui/colors/amber'
import { withStyles } from 'material-ui/styles'
import classNames from 'classnames'

const styles = {
  icon: {
    color: amber[600],
    fontSize: '24px',
    marginLeft: -3,
    height: 48,
    width: 48,
    lineHeight: '48px',
    '&:hover': {
      color: amber[200]
    }
  }
}

@withStyles(styles)
export default class SidelistControlWizard extends React.Component {
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
        icon={(<Icon className={classNames(classes.icon, 'far fa-fw fa-magic')} />)} />
    )
  }
}
