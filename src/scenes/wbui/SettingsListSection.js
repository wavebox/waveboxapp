import React from 'react'
import { List, Paper } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import SettingsListContainer from './SettingsListContainer'
import SettingsListSectionTitle from './SettingsListSectionTitle'

class SettingsListSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...SettingsListSectionTitle.propTypes
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, title, icon, subtitle, children, ...passProps } = this.props

    return (
      <SettingsListContainer {...passProps}>
        <SettingsListSectionTitle title={title} subtitle={subtitle} icon={icon} />
        <Paper>
          <List dense>
            {children}
          </List>
        </Paper>
      </SettingsListContainer>
    )
  }
}

export default SettingsListSection
