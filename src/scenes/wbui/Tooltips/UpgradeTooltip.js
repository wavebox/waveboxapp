import React from 'react'
import ReactPortalTooltip from 'react-portal-tooltip'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import PropTypes from 'prop-types'

let cachedStyles
const styleGenerator = (theme) => {
  const styles = {
    popover: {
      background: ThemeTools.getStateValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor'),
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      fontSize: '13px',
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.upgrade.popover.color'),
      cursor: 'pointer'
    },
    arrow: {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.upgrade.popover.backgroundColor'),
      borderColor: false,
      transition: 'none'
    }
  }
  cachedStyles = styles
  return styles
}

@withStyles(styleGenerator)
class UpgradeTooltip extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    popoverStyle: PropTypes.object,
    popoverArrowStyle: PropTypes.object
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const {
      classes,
      theme,
      popoverStyle,
      popoverArrowStyle,
      ...passProps
    } = this.props

    return (
      <ReactPortalTooltip
        style={{
          style: { ...cachedStyles.popover, ...popoverStyle },
          arrowStyle: { ...cachedStyles.arrow, ...popoverArrowStyle }
        }}
        {...passProps} />
    )
  }
}

export default UpgradeTooltip
