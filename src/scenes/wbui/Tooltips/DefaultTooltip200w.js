import React from 'react'
import ReactPortalTooltip from 'react-portal-tooltip'
import { withStyles } from '@material-ui/core/styles'
import ThemeTools from 'wbui/Themes/ThemeTools'
import PropTypes from 'prop-types'

let cachedStyles
const styleGenerator = (theme) => {
  const styles = {
    popover: {
      background: ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor'),
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
      maxWidth: 200,
      fontSize: '13px',
      color: ThemeTools.getValue(theme, 'wavebox.popover.color')
    },
    arrow: {
      color: ThemeTools.getValue(theme, 'wavebox.popover.backgroundColor'),
      borderColor: false,
      transition: 'none'
    }
  }
  cachedStyles = styles
  return styles
}

@withStyles(styleGenerator)
class DefaultTooltip200w extends React.Component {
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

export default DefaultTooltip200w
