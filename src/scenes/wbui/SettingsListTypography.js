import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import amber from '@material-ui/core/colors/amber'
import blue from '@material-ui/core/colors/blue'
import grey from '@material-ui/core/colors/grey'

const styles = {
  root: {
    '&.type-warning': {
      color: amber[700]
    },
    '&.type-info': {
      color: blue[600]
    },
    '&.type-muted': {
      color: grey[600]
    },
    '&.variant-button-help': {
      display: 'block',
      fontSize: '75%',
      marginTop: 10
    }
  },
  iconWrap: {
    marginRight: 6,
    verticalAlign: 'top',
    '&>*': {
      verticalAlign: 'middle',
      width: 18,
      height: 18
    },
    '&.type-warning>*': {
      color: amber[700]
    },
    '&.type-info>*': {
      color: blue[600]
    },
    '&.type-muted>*': {
      color: grey[600]
    }
  }
}

@withStyles(styles)
class SettingsListTypography extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    type: PropTypes.oneOf(['warning', 'info', 'muted', undefined]),
    variant: PropTypes.oneOf(['button-help', undefined]),
    icon: PropTypes.node
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { type, variant, icon, className, classes, children, ...passProps } = this.props
    const typeClassName = type ? `type-${type}` : undefined
    const variantClassName = variant ? `variant-${variant}` : undefined

    return (
      <span
        className={classNames(classes.root, className, typeClassName, variantClassName)}
        {...passProps}>
        {icon ? (
          <span
            className={classNames(classes.iconWrap, typeClassName, variantClassName)}>
            {icon}
          </span>
        ) : undefined}
        {children}
      </span>
    )
  }
}

export default SettingsListTypography
