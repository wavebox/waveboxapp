import React from 'react'
import SidelistControl from './SidelistControl'
import { settingsStore, settingsActions } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { UISettings } from 'shared/Models/Settings'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import SidelistFAIcon from './SidelistFAIcon'
import ThemeTools from 'wbui/Themes/ThemeTools'
import FARStarIcon from 'wbfa/FARStar'
import { MenuItem, ListItemIcon, ListItemText } from '@material-ui/core'
import FAREyeSlashIcon from 'wbfa/FAREyeSlash'
import FAREyeIcon from 'wbfa/FAREye'

const styles = (theme) => ({
  icon: {
    color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.whatsnew.icon.color'),
    '&:hover': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.whatsnew.icon.color', 'hover')
    },
    '&.has-news': {
      color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.whatsnew.iconWithNews.color'),
      textShadow: ThemeTools.getStateValue(theme, 'wavebox.sidebar.whatsnew.iconWithNews.textShadow'),
      '&:hover': {
        color: ThemeTools.getStateValue(theme, 'wavebox.sidebar.whatsnew.iconWithNews.color', 'hover')
      }
    }
  },
  activeFrame: {
    backgroundColor: ThemeTools.getValue(theme, 'wavebox.sidebar.whatsnew.iconWithNews.backgroundColor')
  },
  tooltipHeadline: {
    maxWidth: 300,
    fontSize: '16px',
    marginTop: 0,
    marginBottom: 0
  },
  tooltipSummary: {
    maxWidth: 300,
    marginTop: 0,
    marginBottom: 0
  },
  contextMenuFAWrap: {
    width: 24,
    height: 24,
    fontSize: 24
  }
})

@withStyles(styles, { withTheme: true })
class SidelistControlWhatsNew extends React.Component {
  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    const { news, ui } = settingsState
    return {
      showMode: ui.showSidebarNewsfeed,
      hasUnseenNews: news.hasUnseenNews,
      headline: news.latestHeadline,
      summary: news.latestSummary
    }
  })()

  settingsChanged = (settingsState) => {
    const { news, ui } = settingsState
    this.setState({
      showMode: ui.showSidebarNewsfeed,
      hasUnseenNews: news.hasUnseenNews,
      headline: news.latestHeadline,
      summary: news.latestSummary
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders the context menu
  * @param onRequestClose: a call which can close the context menu
  * @return array
  */
  renderContextMenu = (onRequestClose) => {
    const { classes } = this.props
    const { showMode } = this.state
    return [
      (showMode !== UISettings.SIDEBAR_NEWS_MODES.NEVER ? (
        <MenuItem
          key='hide'
          onClick={(evt) => {
            onRequestClose(evt, () => {
              settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.NEVER)
            })
          }}>
          <ListItemIcon>
            <span className={classes.contextMenuFAWrap}>
              <FAREyeSlashIcon />
            </span>
          </ListItemIcon>
          <ListItemText inset primary={`Hide What's New`} />
        </MenuItem>
      ) : undefined),
      (showMode !== UISettings.SIDEBAR_NEWS_MODES.UNREAD ? (
        <MenuItem
          key='hide'
          onClick={(evt) => {
            onRequestClose(evt, () => {
              settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.UNREAD)
            })
          }}>
          <ListItemIcon>
            <span className={classes.contextMenuFAWrap}>
              <FAREyeIcon />
            </span>
          </ListItemIcon>
          <ListItemText inset primary={`Only show when there are new items`} />
        </MenuItem>
      ) : undefined),
      (showMode !== UISettings.SIDEBAR_NEWS_MODES.ALWAYS ? (
        <MenuItem
          key='hide'
          onClick={(evt) => {
            onRequestClose(evt, () => {
              settingsActions.sub.ui.setShowSidebarNewsfeed(UISettings.SIDEBAR_NEWS_MODES.ALWAYS)
            })
          }}>
          <ListItemIcon>
            <span className={classes.contextMenuFAWrap}>
              <FAREyeIcon />
            </span>
          </ListItemIcon>
          <ListItemText inset primary={`Always show What's New`} />
        </MenuItem>
      ) : undefined)
    ].filter((i) => !!i)
  }

  render () {
    const { classes } = this.props
    const { hasUnseenNews, showMode, headline, summary } = this.state

    // Check if we should show
    if (showMode === UISettings.SIDEBAR_NEWS_MODES.NEVER) {
      return false
    } else if (showMode === UISettings.SIDEBAR_NEWS_MODES.UNREAD && !hasUnseenNews) {
      return false
    }

    return (
      <SidelistControl
        className={classNames(
          hasUnseenNews ? classes.activeFrame : undefined,
          `WB-SidelistControlWhatsNew`
        )}
        onClick={() => { window.location.hash = '/news' }}
        tooltip={hasUnseenNews && headline && summary ? (
          <div>
            <h1 className={classes.tooltipHeadline}>{headline}</h1>
            <p className={classes.tooltipSummary}>{summary}</p>
          </div>
        ) : (
          `What's new`
        )}
        tourStep={TOUR_STEPS.WHATS_NEW}
        tourTooltip={(
          <div>
            Click here to keep up to date with<br />everything that's new in Wavebox
          </div>
        )}
        icon={(
          <SidelistFAIcon
            className={classNames(classes.icon, hasUnseenNews ? 'has-news' : undefined)}
            IconClass={FARStarIcon} />
        )}
        contextMenuRenderer={this.renderContextMenu} />
    )
  }
}

export default SidelistControlWhatsNew
