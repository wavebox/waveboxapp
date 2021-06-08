import { TouchBar, nativeImage, webContents } from 'electron'
import Resolver from 'Runtime/Resolver'
import { evtMain } from 'AppEvents'
const { TouchBarButton } = TouchBar

let _imageCache

const privWaveboxWindow = Symbol('privWaveboxWindow')
const privBoundTabId = Symbol('privBoundTabId')

const privBackButton = Symbol('privBackButton')
const privForwardButton = Symbol('privForwardButton')
const privReloadStopButton = Symbol('privReloadStopButton')

class NavigationTouchBarProvider {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param waveboxWindow: the wavebox window to bind to
  */
  constructor (waveboxWindow) {
    this[privWaveboxWindow] = waveboxWindow
    this[privBoundTabId] = undefined

    this[privBackButton] = new TouchBarButton({
      icon: this._getImage('navigate_back'),
      click: this._handleNavigateBack
    })
    this[privForwardButton] = new TouchBarButton({
      icon: this._getImage('navigate_forward'),
      click: this._handleNavigateForward
    })
    this[privReloadStopButton] = new TouchBarButton({
      icon: this._getImage('navigate_reload'),
      click: this._handleNavigateStopReload
    })

    this._updateActiveTab()
    evtMain.on(evtMain.WB_TAB_ACTIVATED, this._updateActiveTab)
    evtMain.on(evtMain.WB_TAB_CREATED, this._updateActiveTab)
    evtMain.on(evtMain.WB_TAB_DESTROYED, this._updateActiveTab)

    waveboxWindow.window.setTouchBar(new TouchBar([
      this[privBackButton],
      this[privForwardButton],
      this[privReloadStopButton]
    ]))
  }

  destroy () {
    evtMain.removeListener(evtMain.WB_TAB_ACTIVATED, this._updateActiveTab)
    evtMain.removeListener(evtMain.WB_TAB_CREATED, this._updateActiveTab)
    evtMain.removeListener(evtMain.WB_TAB_DESTROYED, this._updateActiveTab)
    this._unbindTabEvents(this[privBoundTabId])

    this[privWaveboxWindow] = undefined
  }

  /* ****************************************************************************/
  // Tab lifecycle
  /* ****************************************************************************/

  /**
  * Updates the bound tab
  */
  _updateActiveTab = () => {
    const tabId = this[privWaveboxWindow].focusedTabId()
    if (tabId !== this[privBoundTabId]) {
      this._unbindTabEvents(this[privBoundTabId])
      this[privBoundTabId] = tabId
      this._bindTabEvents(tabId)
    }
  }

  /**
  * Unbinds the events from the tab
  * @param tabId: the id of the tab
  */
  _unbindTabEvents (tabId) {
    if (!tabId) { return }
    const wc = webContents.fromId(tabId)
    if (!wc || wc.isDestroyed()) { return }
    wc.removeListener('did-start-navigation', this.updateNavigationState)
    wc.removeListener('did-start-loading', this.updateNavigationState)
    wc.removeListener('did-stop-loading', this.updateNavigationState)
    wc.removeListener('did-navigate-in-page', this.updateNavigationState)
    wc.removeListener('did-navigate', this.updateNavigationState)
  }

  /**
  * Binds the events to the tab
  * @param tabId: the id of the tab
  */
  _bindTabEvents (tabId) {
    if (!tabId) { return }
    const wc = webContents.fromId(tabId)
    if (!wc || wc.isDestroyed()) { return }
    wc.on('did-start-navigation', this.updateNavigationState)
    wc.on('did-start-loading', this.updateNavigationState)
    wc.on('did-stop-loading', this.updateNavigationState)
    wc.on('did-navigate-in-page', this.updateNavigationState)
    wc.on('did-navigate', this.updateNavigationState)
    this.updateNavigationState()
  }

  /**
  * Updates the navigation state
  */
  updateNavigationState = () => {
    let wc
    if (this[privBoundTabId]) {
      wc = webContents.fromId(this[privBoundTabId])
    }

    if (!wc || wc.isDestroyed()) {
      this[privBackButton].icon = this._getImage('navigate_back_muted')
      this[privForwardButton].icon = this._getImage('navigate_forward_muted')
      this[privReloadStopButton].icon = this._getImage('navigate_stop')
    } else {
      this[privBackButton].icon = this._getImage(wc.canGoBack() ? 'navigate_back' : 'navigate_back_muted')
      this[privForwardButton].icon = this._getImage(wc.canGoForward() ? 'navigate_forward' : 'navigate_forward_muted')
      this[privReloadStopButton].icon = this._getImage(wc.isLoading() ? 'navigate_stop' : 'navigate_reload')
    }
  }

  /* ****************************************************************************/
  // UI Events
  /* ****************************************************************************/

  _handleNavigateBack = () => {
    this[privWaveboxWindow].navigateBack()
  }

  _handleNavigateForward = () => {
    this[privWaveboxWindow].navigateForward()
  }

  _handleNavigateStopReload = () => {
    this[privWaveboxWindow].reloadOrStop()
  }

  /* ****************************************************************************/
  // Images
  /* ****************************************************************************/

  /**
  * Builds the image cache so images are only created once
  */
  _buildImageCache () {
    if (_imageCache) { return }
    _imageCache = {
      navigate_back: nativeImage.createFromPath(Resolver.image('touchbar/navigate_back.png')),
      navigate_back_muted: nativeImage.createFromPath(Resolver.image('touchbar/navigate_back_muted.png')),
      navigate_forward: nativeImage.createFromPath(Resolver.image('touchbar/navigate_forward.png')),
      navigate_forward_muted: nativeImage.createFromPath(Resolver.image('touchbar/navigate_forward_muted.png')),
      navigate_stop: nativeImage.createFromPath(Resolver.image('touchbar/navigate_stop.png')),
      navigate_reload: nativeImage.createFromPath(Resolver.image('touchbar/navigate_reload.png'))
    }
  }

  /**
  * @param name: the name of the image
  * @return the nativeimage
  */
  _getImage (name) {
    this._buildImageCache()
    return _imageCache[name]
  }
}

export default NavigationTouchBarProvider
