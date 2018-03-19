import RendererSettingsStore from 'shared/AltStores/Settings/RendererSettingsStore'
import { STORE_NAME } from 'shared/AltStores/Settings/AltSettingsIdentifiers'
import { SettingsIdent } from 'shared/Models/Settings'
import alt from '../alt'
import { NEWS_SYNC_PERIOD } from 'shared/constants'
import { TOUR_STEPS, TOUR_STEPS_ORDER } from './Tour'
import WaveboxHTTP from 'Server/WaveboxHTTP'
import actions from './settingsActions'

class SettingsStore extends RendererSettingsStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    super()

    this.newsSync = null
    this.tourStep = TOUR_STEPS.NONE

    /* ****************************************/
    // News
    /* ****************************************/

    /**
    * @return true if the news is being synced
    */
    this.isSyncingNews = () => { return this.newsSync !== null }

    /* ****************************************/
    // Tour
    /* ****************************************/

    /**
    * @return true if the tour is active
    */
    this.isTourActive = () => this.tourStep !== TOUR_STEPS.NONE

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleStartSyncingNews: actions.START_SYNCING_NEWS,
      handleStopSyncingNews: actions.STOP_SYNCING_NEWS,
      handleOpenAndMarkNews: actions.OPEN_AND_MARK_NEWS,

      handleTourStart: actions.TOUR_START,
      handleTourNext: actions.TOUR_NEXT,
      handleTourNextIfActive: actions.TOUR_NEXT_IF_ACTIVE,
      handleTourQuit: actions.TOUR_QUIT
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad (...args) {
    super.handleLoad(...args)
    actions.startSyncingNews.defer()
  }

  /* **************************************************************************/
  // News Sync
  /* **************************************************************************/

  /**
  * Gets the latest news info from the server and updates the store
  * with the given response
  */
  _syncNews () {
    WaveboxHTTP.fetchLatestNewsHeading()
      .then((res) => {
        actions.mergeSettingsModelChangeset.defer(SettingsIdent.SEGMENTS.NEWS, {
          latestTimestamp: res.latest.timestamp,
          latestHeadline: res.latest.headline,
          latestSummary: res.latest.summary
        })
      })
      .catch(() => { /* no-op */ })
  }

  handleStartSyncingNews () {
    if (this.isSyncingNews()) {
      this.preventDefault()
      return
    }

    this.newsSync = setInterval(() => {
      this._syncNews()
    }, NEWS_SYNC_PERIOD)
    this._syncNews()
  }

  handleStopSyncingNews () {
    clearTimeout(this.newsSync)
  }

  handleOpenAndMarkNews () {
    this.preventDefault()
    window.location.hash = '/news'
    if (this.news.hasLatestInfo) {
      actions.mergeSettingsModelChangeset.defer(SettingsIdent.SEGMENTS.NEWS, {
        lastSeenTimestamp: this.news.latestTimestamp
      })
    }
  }

  /* **************************************************************************/
  // Tour
  /* **************************************************************************/

  handleTourStart () {
    this.preventDefault()
    if (this.app.hasSeenAppTour) { return }
    this.tourStep = TOUR_STEPS.NONE
    actions.tourNext.defer()
  }

  handleTourNext () {
    const currentIndex = TOUR_STEPS_ORDER.findIndex((step) => step === this.tourStep)
    const nextStep = TOUR_STEPS_ORDER.find((step, index) => {
      if (index <= currentIndex) { return false }

      if (step === TOUR_STEPS.WHATS_NEW) {
        if (this.ui.showSidebarNewsfeed) { return true }
      } else if (step === TOUR_STEPS.APP_WIZARD) {
        if (!this.app.hasSeenAppWizard) { return true }
      } else if (step === TOUR_STEPS.SUPPORT_CENTER) {
        if (this.ui.showSidebarSupport) { return true }
      } else {
        return true
      }
    })

    if (nextStep) {
      this.tourStep = nextStep
    } else {
      this.tourStep = TOUR_STEPS.NONE
      actions.mergeSettingsModelChangeset.defer(SettingsIdent.SEGMENTS.APP, 'hasSeenAppTour', true)
    }
  }

  handleTourNextIfActive () {
    if (this.isTourActive()) {
      this.handleTourNext()
    }
  }

  handleTourQuit () {
    this.preventDefault()
    this.tourStep = TOUR_STEPS.NONE
    actions.mergeSettingsModelChangeset.defer(SettingsIdent.SEGMENTS.APP, 'hasSeenAppTour', true)
  }
}

export default alt.createStore(SettingsStore, STORE_NAME)
