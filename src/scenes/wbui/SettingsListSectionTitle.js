import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'
import classNames from 'classnames'

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
  },
  titleIconWrap: {
    marginRight: 6,
    '&>*': {
      height: 20,
      width: 20,
      verticalAlign: 'middle'
    }
  }
}

@withStyles(styles)
class SettingsListSectionTitle extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    title: PropTypes.node,
    subtitle: PropTypes.node,
    icon: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes, className, title, icon, subtitle, children, ...passProps } = this.props

    if (!title && !subtitle && !icon) { return false }

    return (
      <h3 className={classNames(classes.title, className)} {...passProps}>
        {icon ? (
          <span className={classes.titleIconWrap}>{icon}</span>
        ) : undefined}
        {title ? (<span className={classes.titleText}>{title}</span>) : undefined}
        {subtitle ? (<span className={classes.subtitleText}>{subtitle}</span>) : undefined}
      </h3>
    )
  }
}

export default SettingsListSectionTitle
