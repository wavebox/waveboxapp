import PropTypes from 'prop-types'
import React from 'react'
import ToolbarExtension from './ToolbarExtension'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import KRXFramework from 'Runtime/KRXFramework'

const styles = {
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  }
}

@withStyles(styles)
class ToolbarExtensions extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    tabId: PropTypes.number,
    toolbarHeight: PropTypes.number.isRequired
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    //TODO change events
    return {
      extensionIds: KRXFramework.browserActionIds()
    }
  })()

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  render () {
    const { extensionIds } = this.state
    if (!extensionIds.length) { return false }
    const {
      toolbarHeight,
      tabId,
      style,
      classes,
      className,
      ...passProps
    } = this.props

    return (
      <div
        {...passProps}
        className={classNames(classes.buttons, className)}
        style={{ height: toolbarHeight, ...style }}>
        {extensionIds.map((extensionId) => {
          return (
            <ToolbarExtension
              toolbarHeight={toolbarHeight}
              key={extensionId}
              extensionId={extensionId}
              tabId={tabId} />)
        })}
      </div>
    )
  }
}

export default ToolbarExtensions
