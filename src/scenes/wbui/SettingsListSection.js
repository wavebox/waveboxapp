import PropTypes from 'prop-types'
import React from 'react'
import { List, Paper } from 'material-ui'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from 'material-ui/styles'
import grey from 'material-ui/colors/grey'
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
export default class SettingsListSection extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.node.isRequired,
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
        <h3 className={classes.title}>
          <span className={classes.titleText}>{title}</span>
          {subtitle ? (
            <span className={classes.subtitleText}>{subtitle}</span>
          ) : undefined}
        </h3>
        <Paper>
          <List dense>
            {children}
          </List>
        </Paper>
      </SettingsListContainer>
    )
  }
}
