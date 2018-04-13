import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import electron from 'electron'
import uuid from 'uuid'

const camelCase = function (name) {
  return name.split('-').map((token, index) => {
    return index === 0 ? token : (token.charAt(0).toUpperCase() + token.slice(1))
  }).join('')
}

const WARN_CAPTURE_PAGE_TIMEOUT = 1500
const MAX_CAPTURE_PAGE_TIMEOUT = 2500
const SEND_RESPOND_PREFIX = '__SEND_RESPOND__'
const WEBVIEW_EVENTS = [
  'load-commit',
  'did-finish-load',
  'did-fail-load',
  'did-frame-finish-load',
  'did-start-loading',
  'did-stop-loading',
  'did-get-response-details',
  'did-get-redirect-request',
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

export default class WebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  static propTypes = {
    onWebContentsAttached: PropTypes.func,
    ...WEBVIEW_PROPS,
    ...REACT_WEBVIEW_EVENT_PROPS
  }

  static REACT_WEBVIEW_EVENTS = REACT_WEBVIEW_EVENTS
  static WEBVIEW_METHODS = WEBVIEW_METHODS

  /* **************************************************************************/
  // Object lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    const self = this
    WEBVIEW_METHODS.forEach((m) => {
      if (self[m] !== undefined) { return } // Allow overwriting
      this[m] = function () {
        const node = self.getWebviewNode()
        return node[m].apply(node, Array.from(arguments))
      }
    })
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.ipcPromises = {}

    const node = this.getWebviewNode()
    WEBVIEW_EVENTS.forEach((name) => {
      node.addEventListener(name, (evt) => {
        this.dispatchWebViewEvent(name, evt)
      })
    })

    // Wait for the DOM to paint before running this
    let webContentsAttachedAttempts = 0
    this.webContentsAttachedInterval = setInterval(() => {
      webContentsAttachedAttempts++
      const webContents = node.getWebContents()
      if (webContents) {
        clearInterval(this.webContentsAttachedInterval)
        if (this.props.onWebContentsAttached) {
          this.props.onWebContentsAttached(webContents)
        }
      }

      if (webContentsAttachedAttempts > 2000) {
        clearInterval(this.webContentsAttachedInterval)
      }
    }, 1)
  }

  componentWillUnmount () {
    clearInterval(this.webContentsAttachedInterval)
  }

  componentWillReceiveProps (nextProps) {
    const changed = SUPPORTED_ATTRS.filter((name) => this.props[name] !== nextProps[name])
    if (changed.length) {
      const node = this.getWebviewNode()
      changed.forEach((name) => {
        node.setAttribute(name, nextProps[name] || '')
      })
    }
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Dispatches a webview event to the appropriate handler
  * @param name: the name of the event
  * @param evt: the event that fired
  */
  dispatchWebViewEvent (name, evt) {
    const ccName = camelCase(name)
    if (name === 'ipc-message') {
      const didSiphon = this.siphonIPCMessage(evt)
      if (!didSiphon) {
        if (this.props[ccName]) { this.props[ccName](evt) }
      }
    } else if (name === 'console-message') {
      if (evt.message.startsWith(ELEVATED_LOG_PREFIX)) {
        const logArgs = [
          '[ELEVATED WEBVIEW LOG]',
          this.getWebviewNode(),
          `line=${evt.line}`,
          `sourceId=${evt.sourceId}`,
          evt.message
        ]
        switch (evt.level) {
          case 1: console.warn(...logArgs); break
          case 2: console.error(...logArgs); break
          default: console.log(...logArgs); break
        }
      }
      if (this.props[ccName]) { this.props[ccName](evt) }
    } else {
      if (this.props[ccName]) { this.props[ccName](evt) }
    }
  }

  /**
  * Siphons IPC messages
  * @param evt: the event that occured
  * @return true if the event was handled in the siphon
  */
  siphonIPCMessage (evt) {
    if (typeof (evt.channel.type) !== 'string') { return false }

    if (evt.channel.type.indexOf(SEND_RESPOND_PREFIX) === 0) {
      if (this.ipcPromises[evt.channel.type]) {
        clearTimeout(this.ipcPromises[evt.channel.type].timeout)
        this.ipcPromises[evt.channel.type].resolve(evt.channel.data)
        delete this.ipcPromises[evt.channel.type]
      }
      return true
    } else {
      return false
    }
  }

  /* **************************************************************************/
  // Webview calls
  /* **************************************************************************/

  /**
  * Focuses the webview, only if not in focus already
  * @return true if focused, false otherwise
  */
  focus = () => {
    const node = this.getWebviewNode()
    if (document.activeElement !== node) {
      this.getWebviewNode().focus()
      return true
    } else {
      return false
    }
  }

  /**
  * Captures a screenshot of the webview page. Includes a fix for retina display
  * not automatically getting the correct size https://github.com/electron/electron/issues/8314
  * Also includes a fix for capture not working when the element is not visible
  * @param [rect]: the area of the page to be captured
  * @param callback: executed on complete
  */
  capturePage = (arg1, arg2) => {
    const node = this.getWebviewNode()
    if (typeof (arg1) === 'object' && typeof (arg2) === 'function') {
      // Check if anyone else is capturing
      if (node.getAttribute('data-webview-capture-action') === 'capture') {
        arg2(null, new Error('Failed to capture, capture already in progress'))
      }

      // Attach a style to the page that can't be overwritten in case anyone else
      // tries to change the style in the meatime
      const id = uuid.v4()
      const style = document.createElement('style')
      style.innerHTML = `webview[data-webview-capture-id="${id}"][data-webview-capture-action="capture"] { visibility: visible !important; }`
      document.head.appendChild(style)
      node.setAttribute('data-webview-capture-id', id)
      node.setAttribute('data-webview-capture-action', 'capture')

      const timeoutWarn = setTimeout(() => {
        console.warn(
          `Calling webview.capturePage is taking more than ${WARN_CAPTURE_PAGE_TIMEOUT}ms.`,
          `This can be indicitive of an error or if the api is never going to return.`,
          node
        )
      }, WARN_CAPTURE_PAGE_TIMEOUT)
      const timeout = setTimeout(() => {
        arg2(null, new Error(`Failed to capture. Took more that ${MAX_CAPTURE_PAGE_TIMEOUT}`))
      }, MAX_CAPTURE_PAGE_TIMEOUT)

      // Run the capture
      setTimeout(() => {
        try {
          node.capturePage(arg1, (img) => {
            clearTimeout(timeoutWarn)
            clearTimeout(timeout)
            setTimeout(() => {
              if (style.parentElement) { style.parentElement.removeChild(style) }
              node.removeAttribute('data-webview-capture-id')
              node.removeAttribute('data-webview-capture-action')
              arg2(img)
            })
          })
        } catch (ex) {
          clearTimeout(timeoutWarn)
          clearTimeout(timeout)
          arg2(null, ex)
        }
      })
    } else if (typeof (arg1) === 'function') {
      node.executeJavaScript(`(function () {
        return { height: window.innerHeight, width: window.innerWidth }
      })()`, (r) => {
        const scaleFactor = electron.screen.getPrimaryDisplay().scaleFactor
        this.capturePage({
          x: 0,
          y: 0,
          width: r.width * scaleFactor,
          height: r.height * scaleFactor
        }, arg1)
      })
    } else {
      throw new Error('Invalid signature call to "capturePage"')
    }
  }

  /**
  * Calls out to capturePage but returns a promise
  * @param [rect]: the rect to capture in the page
  * @return promise
  */
  capturePagePromise = (rect) => {
    return new Promise((resolve, reject) => {
      const args = [rect, (img, optError) => {
        if (img) {
          resolve(img)
        } else {
          reject(optError || new Error('No image returned from underlying api call'))
        }
      }].filter((a) => !!a)
      this.capturePage(...args)
    })
  }

  /* **************************************************************************/
  // IPC Utils
  /* **************************************************************************/

  /**
  * Calls into the webview to get some data
  * @param sendName: the name to send to the webview
  * @param obj={}: the object to send into the webview. Note __respond__ is reserved
  * @param timeout=5000: the timeout before rejection
  * @return promise
  */
  sendWithResponse = (sendName, obj = {}, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString()
      const respondName = SEND_RESPOND_PREFIX + ':' + sendName + ':' + id
      const rejectTimeout = setTimeout(() => {
        delete this.ipcPromises[respondName]
        reject(new Error('Request Timeout'))
      }, timeout)
      this.ipcPromises[respondName] = { resolve: resolve, timeout: rejectTimeout }
      this.getWebviewNode().send(sendName, Object.assign({}, obj, { __respond__: respondName }))
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  /**
  * @return the webview node
  */
  getWebviewNode = () => {
    return ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
  }

  shouldComponentUpdate () {
    return false // we never want to re-render. We will handle this manually in componentWillReceiveProps
  }

  render () {
    const attrs = SUPPORTED_ATTRS
      .filter((k) => this.props[k] !== undefined && this.props[k] !== false)
      .map((k) => {
        return `${k}="${this.props[k]}"`
      })
      .concat([
        'style="position:absolute; top:0; bottom:0; right:0; left:0;"'
      ])
      .join(' ')

    return (
      <div
        style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }}
        dangerouslySetInnerHTML={{__html: `<webview ${attrs}></webview>`}} />
    )
  }
}
