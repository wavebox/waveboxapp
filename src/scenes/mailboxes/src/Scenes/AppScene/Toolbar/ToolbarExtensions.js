import PropTypes from 'prop-types'
import React from 'react'
import ToolbarExtension from './ToolbarExtension'
import { crextensionStore } from 'stores/crextension'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

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
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    crextensionStore.listen(this.crextensionUpdated)
  }

  componentWillUnmount () {
    crextensionStore.unlisten(this.crextensionUpdated)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const crextensionState = crextensionStore.getState()
    return {
      extensionIds: crextensionState.browserActionExtensionIds()
    }
  })()

  crextensionUpdated = (crextensionState) => {
    this.setState({
      extensionIds: crextensionState.browserActionExtensionIds()
    })
  }

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
