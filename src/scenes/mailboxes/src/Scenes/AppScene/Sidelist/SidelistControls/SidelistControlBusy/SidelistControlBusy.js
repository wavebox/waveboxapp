import React from 'react'
import SidelistControl from '../SidelistControl'
import { withStyles } from '@material-ui/core/styles'
import { settingsStore } from 'stores/settings'
import ThemeTools from 'wbui/Themes/ThemeTools'
import shallowCompare from 'react-addons-shallow-compare'
import SidelistControlBusyContextMenu from './SidelistControlBusyContextMenu'
import CoreServiceWebViewHibernator from 'Scenes/AppScene/ServiceTab/CoreServiceWebView/CoreServiceWebViewHibernator'
import pluralize from 'pluralize'
import Spinner from 'wbui/Activity/Spinner'

@withStyles({}, { withTheme: true })
class SidelistControlBusy extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    CoreServiceWebViewHibernator.getConcurrencyLock().on('changed', this.handleLockChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    CoreServiceWebViewHibernator.getConcurrencyLock().removeListener('changed', this.handleLockChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const concurrencyLock = CoreServiceWebViewHibernator.getConcurrencyLock()
    const awakenCount = concurrencyLock.loadingCount + concurrencyLock.waitingCount
    return {
      show: settingsStore.getState().ui.showSidebarBusy,
      awakenCount: awakenCount,
      awakenCountShows: awakenCount > 1
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({
      show: settingsState.ui.showSidebarBusy
    })
  }

  handleLockChanged = (evt) => {
    this.setState((prevState) => {
      const awakenCount = evt.sender.loadingCount + evt.sender.waitingCount
      return {
        awakenCount: awakenCount,
        awakenCountShows: awakenCount > 1
          ? true
          : (prevState.awakenCountShows && awakenCount > 0)
      }
    })
    this.setState({
      awakenCount: evt.sender.loadingCount + evt.sender.waitingCount
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { theme } = this.props
    const { awakenCount, awakenCountShows, show } = this.state

    if (!show) { return false }
    if (!awakenCountShows) { return false }

    return (
      <SidelistControl
        className={`WB-SidelistControlBusy`}
        onClick={() => { /* no-op */ }}
        onContextMenu={this.showContextMenu}
        tooltip={`Waking up ${awakenCount} ${pluralize('services', awakenCount)}`}
        icon={(
          <Spinner
            size={16}
            color={ThemeTools.getStateValue(theme, 'wavebox.sidebar.busy.icon.color')}
            speed={0.75} />
        )}
        ContextMenuComponent={SidelistControlBusyContextMenu} />
    )
  }
}

export default SidelistControlBusy
