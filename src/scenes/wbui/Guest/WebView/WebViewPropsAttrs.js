import camelCase from './camelCase'
import PropTypes from 'prop-types'

const WEBVIEW_EVENTS = [
  'load-commit',
  'did-finish-load',
  'did-fail-load',
  'did-frame-finish-load',
  'did-start-loading',
  'did-stop-loading',
  'did-navigate',
  'did-navigate-in-page',
  'dom-ready',
  'page-title-updated',
  'page-favicon-updated',
  'enter-html-full-screen',
  'leave-html-full-screen',
  'console-message',
  'new-window',
  'close',
  'ipc-message',
  'crashed',
  'gpu-crashed',
  'plugin-crashed',
  'destroyed',
  'focus',
  'blur',
  'update-target-url',
  'will-navigate',
  'did-change-theme-color'
]
const REACT_WEBVIEW_EVENTS = WEBVIEW_EVENTS.map((n) => camelCase(n))
const REACT_WEBVIEW_EVENT_PROPS = REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
  acc[name] = PropTypes.func
  return acc
}, {})

const WEBVIEW_PROPS = {
  allowpopups: PropTypes.bool,
  autosize: PropTypes.bool,
  blinkfeatures: PropTypes.string,
  disableblinkfeatures: PropTypes.string,
  disableguestresize: PropTypes.bool,
  disablewebsecurity: PropTypes.bool,
  guestinstance: PropTypes.number,
  httpreferrer: PropTypes.string,
  nodeintegration: PropTypes.bool,
  partition: PropTypes.string,
  plugins: PropTypes.bool,
  preload: PropTypes.string,
  src: PropTypes.string,
  useragent: PropTypes.string,
  webpreferences: PropTypes.string
}
const WEBVIEW_ATTRS = Object.keys(WEBVIEW_PROPS)
const HTML_ATTRS = ['id'] // we don't support all attributes
const SUPPORTED_ATTRS = [].concat(WEBVIEW_ATTRS, HTML_ATTRS)

const WEBVIEW_METHODS = [
  'blur',
  'canGoBack',
  'canGoForward',
  'canGoToOffset',
  'capturePage',
  'capturePagePromise', // addition
  'clearHistory',
  'copy',
  'cut',
  'delete',
  'executeJavaScript',
  'focus',
  'findInPage',
  'getURL',
  'getTitle',
  'getWebContents',
  'getUserAgent',
  'goBack',
  'goForward',
  'goToIndex',
  'goToOffset',
  'insertCSS',
  'inspectElement',
  'insertText',
  'inspectServiceWorker',
  'isAudioMuted',
  'isCrashed',
  'isDevToolsOpened',
  'isDevToolsFocused',
  'isLoading',
  'isWaitingForResponse',
  'loadURL',
  'navigateBack',
  'navigateForward',
  'openDevTools',
  'closeDevTools',
  'paste',
  'pasteAndMatchStyle',
  'redo',
  'reload',
  'reloadIgnoringCache',
  'replace',
  'replaceMisspelling',
  'print',
  'printToPDF',
  'selectAll',
  'send',
  'sendInputEvent',
  'setAudioMuted',
  'setUserAgent',
  'setZoomFactor',
  'setZoomLevel',
  'showDefinitionForSelection',
  'stop',
  'stopFindInPage',
  'undo',
  'unselect'
]

export {
  WEBVIEW_EVENTS,
  REACT_WEBVIEW_EVENTS,
  REACT_WEBVIEW_EVENT_PROPS,
  WEBVIEW_PROPS,
  WEBVIEW_ATTRS,
  HTML_ATTRS,
  SUPPORTED_ATTRS,
  WEBVIEW_METHODS
}
