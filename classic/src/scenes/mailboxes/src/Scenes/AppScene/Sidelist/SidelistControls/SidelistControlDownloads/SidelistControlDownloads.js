import React from 'react'
import SidelistControl from '../SidelistControl'
import { settingsStore } from 'stores/settings'
import { localHistoryStore } from 'stores/localHistory'
import shallowCompare from 'react-addons-shallow-compare'
import { UISettings } from 'shared/Models/Settings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import SidelistFAIcon from '../SidelistFAIcon'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FASArrowToBottom from 'wbfa/FASArrowToBottom'
import { Popover, CircularProgress } from '@material-ui/core'
import pluralize from 'pluralize'
import DownloadsPopoutContent from './DownloadsPopoutContent'
import ReactDOM from 'react-dom'
import StyleMixins from 'wbui/Styles/StyleMixins'
import SidelistControlDownloadsContextMenu from './SidelistControlDownloadsContextMenu'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.downloads.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.downloads.icon.color', 'hover')
    }
  },
  popout: {
    maxHeight: 500,
    maxWidth: 400,
    marginLeft: -10,
    overflowY: 'auto',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  popoutBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  progressWrap: {
    position: 'relative'
  },
  progress: {
    position: 'absolute',
    top: 3,
    left: -7
  },
  progressCircle: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.downloads.icon.color')
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlDownloads extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.rootRef = React.createRef()
    this.deferredHide = null
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
    localHistoryStore.listen(this.localHistoryChanged)

    window.addEventListener('hashchange', this.closePopout)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
    localHistoryStore.unlisten(this.localHistoryChanged)

    window.removeEventListener('hashchange', this.closePopout)
    clearTimeout(this.deferredHide)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const localHistoryState = localHistoryStore.getState()
    return {
      showMode: settingsState.ui.showSidebarDownloads,
      hasActiveDownloads: localHistoryState.hasActiveDownloads(),
      activeDownloadCount: localHistoryState.getActiveDownloadCount(),
      activeDownloadPercent: localHistoryState.getActiveDownloadPercent(),
      popoutAnchor: null,
      deferredHold: false
    }
  })()

  settingsChanged = (settingsState) => {
    this.setState({ showMode: settingsState.ui.showSidebarDownloads })
  }

  localHistoryChanged = (localHistoryState) => {
    this.setState((prevState) => {
      const update = {
        hasActiveDownloads: localHistoryState.hasActiveDownloads(),
        activeDownloadCount: localHistoryState.getActiveDownloadCount(),
        activeDownloadPercent: localHistoryState.getActiveDownloadPercent()
      }

      if (update.hasActiveDownloads !== prevState.hasActiveDownloads) {
        clearTimeout(this.deferredHide)
        if (update.hasActiveDownloads === false) {
          update.deferredHold = true
          this.deferredHide = setTimeout(() => {
            this.setState({ deferredHold: false })
          }, 3000)
        } else {
          update.deferredHold = false
        }
      }

      return update
    })
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  openPopout = (evt) => {
    this.setState({ popoutAnchor: ReactDOM.findDOMNode(this.rootRef.current) })
  }

  closePopout = () => {
    this.setState((prevState) => {
      if (!prevState.popoutAnchor) {
        return undefined
      } else {
        clearTimeout(this.deferredHide)
        this.deferredHide = setTimeout(() => {
          this.setState({ deferredHold: false })
        }, 3000)
        return {
          popoutAnchor: null,
          deferredHold: true
        }
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { classes } = this.props
    const {
      showMode,
      hasActiveDownloads,
      activeDownloadCount,
      activeDownloadPercent,
      popoutAnchor,
      deferredHold
    } = this.state

    // Check if we should show
    if (!popoutAnchor) {
      if (showMode === UISettings.SIDEBAR_DOWNLOAD_MODES.NEVER) {
        return false
      } else if (showMode === UISettings.SIDEBAR_DOWNLOAD_MODES.ACTIVE) {
        if (!hasActiveDownloads && !deferredHold) {
          return false
        }
      }
    }

    return (
      <React.Fragment>
        <SidelistControl
          ref={this.rootRef}
          className={classNames(`WB-SidelistControlDownloads`)}
          onClick={this.openPopout}
          tooltip={hasActiveDownloads ? (
            `${activeDownloadCount} ${pluralize('Downloads', activeDownloadCount)} - ${Math.round(activeDownloadPercent)}%`
          ) : (
            `Downloads`
          )}
          icon={(
            <span className={classes.progressWrap}>
              {hasActiveDownloads ? (
                <CircularProgress
                  className={classes.progress}
                  classes={{ circle: classes.progressCircle }}
                  value={activeDownloadPercent}
                  size={28}
                  variant='static' />
              ) : undefined}
              <SidelistFAIcon
                className={classNames(classes.icon)}
                IconClass={FASArrowToBottom} />
            </span>
          )}
          ContextMenuComponent={SidelistControlDownloadsContextMenu} />
        <Popover
          anchorEl={popoutAnchor}
          anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
          BackdropProps={{
            classes: { root: classes.popoutBackdrop }
          }}
          disableEnforceFocus
          open={!!popoutAnchor}
          classes={{ paper: classes.popout }}
          onClose={this.closePopout}>
          <DownloadsPopoutContent />
        </Popover>
      </React.Fragment>
    )
  }
}

export default SidelistControlDownloads
