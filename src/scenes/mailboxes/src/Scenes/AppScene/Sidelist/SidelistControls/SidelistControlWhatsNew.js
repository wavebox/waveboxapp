import React from 'react'
import { FontIcon } from 'material-ui'
import SidelistControl from './SidelistControl'
import * as Colors from 'material-ui/styles/colors'
import { settingsStore } from 'stores/settings'
import shallowCompare from 'react-addons-shallow-compare'
import { TOUR_STEPS } from 'stores/settings/Tour'
import { UISettings } from 'shared/Models/Settings'

const styles = {
  icon: {
    fontSize: '24px',
    marginLeft: -3
  },
  activeIcon: {
    textShadow: `0px 0px 3px ${Colors.red50}`
  },
  activeFrame: {
    backgroundColor: Colors.red400
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
  }
}

export default class SidelistControlWhatsNew extends React.Component {
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

  render () {
    const { hasUnseenNews, showMode, headline, summary } = this.state

    // Check if we should show
    if (showMode === UISettings.SIDEBAR_NEWS_MODES.NEVER) {
      return false
    } else if (showMode === UISettings.SIDEBAR_NEWS_MODES.UNREAD && !hasUnseenNews) {
      return false
    }

    return (
      <SidelistControl
        className={`WB-SidelistControlWhatsNew`}
        onClick={() => { window.location.hash = '/news' }}
        tooltip={hasUnseenNews && headline && summary ? (
          <div>
            <h1 style={styles.tooltipHeadline}>{headline}</h1>
            <p style={styles.tooltipSummary}>{summary}</p>
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
        style={hasUnseenNews ? styles.activeFrame : undefined}
        iconStyle={{
          ...styles.icon,
          ...(hasUnseenNews ? styles.activeIcon : undefined)
        }}
        icon={(
          <FontIcon
            className='far fa-fw fa-star'
            color={hasUnseenNews ? Colors.red100 : Colors.red400}
            hoverColor={hasUnseenNews ? Colors.red50 : Colors.red100} />
        )} />
    )
  }
}
