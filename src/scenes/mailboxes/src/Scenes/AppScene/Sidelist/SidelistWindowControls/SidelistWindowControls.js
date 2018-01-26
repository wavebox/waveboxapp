import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistWindowControl from './SidelistWindowControl'
import { remote } from 'electron'
import classnames from 'classnames'

const HAS_WINDOW_CONTROLS = process.platform !== 'darwin'
const styles = {
  placeholder: {
    height: 25,
    minHeight: 25
  },
  container: {
    height: 25,
    width: 70,
    paddingTop: 3,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}

export default class SidelistWindowControls extends React.Component {
  /* **************************************************************************/
  // Component lifecyle
  /* **************************************************************************/

  componentDidMount () {
    if (HAS_WINDOW_CONTROLS) {
      const currentWindow = remote.getCurrentWindow()
      currentWindow.on('maximize', this.handleWindowMaximize)
      currentWindow.on('unmaximize', this.handleWindowUnmaximize)
    }
  }

  componentWillUnmount () {
    if (HAS_WINDOW_CONTROLS) {
      const currentWindow = remote.getCurrentWindow()
      currentWindow.removeListener('maximize', this.handleWindowMaximize)
      currentWindow.removeListener('unmaximize', this.handleWindowUnmaximize)
    }
  }

  /* **************************************************************************/
  // Data lifecyle
  /* **************************************************************************/

  state = {
    isWindowMaximized: HAS_WINDOW_CONTROLS ? remote.getCurrentWindow().isMaximized() : undefined
  }

  /* **************************************************************************/
  // Window Events
  /* **************************************************************************/

  handleWindowMaximize = () => {
    this.setState({ isWindowMaximized: true })
  }

  handleWindowUnmaximize = () => {
    this.setState({ isWindowMaximized: false })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { style, className, ...passProps } = this.props

    if (HAS_WINDOW_CONTROLS) {
      const { isWindowMaximized } = this.state
      return (
        <div
          {...passProps}
          style={{ ...styles.container, ...style }}
          className={classnames('WB-SidelistWindowControls', className)}>
          <SidelistWindowControl
            type={SidelistWindowControl.TYPES.CLOSE}
            onClick={() => remote.getCurrentWindow().close()} />
          {isWindowMaximized ? (
            <SidelistWindowControl
              type={SidelistWindowControl.TYPES.RESTORE}
              onClick={() => remote.getCurrentWindow().unmaximize()} />
          ) : (
            <SidelistWindowControl
              type={SidelistWindowControl.TYPES.MAXIMIZE}
              onClick={() => remote.getCurrentWindow().maximize()} />
          )}
          <SidelistWindowControl
            type={SidelistWindowControl.TYPES.MINIMIZE}
            onClick={() => remote.getCurrentWindow().minimize()} />
        </div>
      )
    } else {
      return (<div {...passProps} style={{ ...styles.placeholder, ...style }} />)
    }
  }
}
