import PropTypes from 'prop-types'
import React from 'react'
import { List, Paper } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import SettingsListContainer from './SettingsListContainer'

const styles = {
  title: {
    marginTop: 20,
    marginBottom: 10
  },
  titleText: {
    color: grey[800],
    fontSize: 16
  },
  subtitleText: {
    color: grey[700],
    fontSize: 14,
    marginLeft: 6,
    fontWeight: 'normal'
  }
}

@withStyles(styles)
class SettingsListSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.node,
    subtitle: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, title, subtitle, children, ...passProps } = this.props

    return (
      <SettingsListContainer {...passProps}>
        {title || subtitle ? (
          <h3 className={classes.title}>
            {title ? (<span className={classes.titleText}>{title}</span>) : undefined}
            {subtitle ? (<span className={classes.subtitleText}>{subtitle}</span>) : undefined}
          </h3>
        ) : undefined}
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
