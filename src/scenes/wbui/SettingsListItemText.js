import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListItem from './SettingsListItem'
import SettingsListTypography from './SettingsListTypography'
import { ListItemText } from '@material-ui/core'

class SettingsListItemText extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    primary: PropTypes.node,
    primaryIcon: PropTypes.node,
    primaryType: PropTypes.oneOf(['warning', 'info', 'muted', undefined]),
    secondary: PropTypes.node,
    secondaryIcon: PropTypes.node,
    secondaryType: PropTypes.oneOf(['warning', 'info', 'muted', undefined])
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      primary,
      primaryIcon,
      primaryType,
      secondary,
      secondaryIcon,
      secondaryType,
      ...passProps
    } = this.props

    return (
      <SettingsListItem {...passProps}>
        <ListItemText
          primary={primary || primaryIcon ? (
            <SettingsListTypography icon={primaryIcon} type={primaryType}>
              {primary}
            </SettingsListTypography>
          ) : undefined}
          secondary={secondary || secondaryIcon ? (
            <SettingsListTypography icon={secondaryIcon} type={secondaryType}>
              {secondary}
            </SettingsListTypography>
          ) : undefined}
        />
      </SettingsListItem>
    )
  }
}

export default SettingsListItemText
