import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import electron from 'electron'
import camelCase from './camelCase'
import {
  WEBVIEW_EVENTS,
  REACT_WEBVIEW_EVENTS,
  REACT_WEBVIEW_EVENT_PROPS,
  WEBVIEW_PROPS,
  SUPPORTED_ATTRS,
  WEBVIEW_METHODS
} from './WebViewPropsAttrs'
const WARN_CAPTURE_PAGE_TIMEOUT = 3000
const MAX_CAPTURE_PAGE_TIMEOUT = 4000
const SEND_RESPOND_PREFIX = '__SEND_RESPOND__'
const INTERCEPTED_WEBVIEW_EVENTS = new Set(['ipc-message', 'console-message'])

let stylesheetAttached = false
const stylesheet = document.createElement('style')
stylesheet.innerHTML = `
  .RC-WebView-Root { position:absolute; top:0; left:0; right:0; bottom:0; }
  .RC-WebView-Root>webview { position:absolute; top:0; left:0; right:0; bottom:0; }
  .RC-WebView-Root>webview.first-load-incomplete { visibility: visible !important; }
  .RC-WebView-Root>webview.capture-in-progress { visibility: visible !important; }
`

class WebView extends React.Component {
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

    if (!stylesheetAttached) {
      document.head.appendChild(stylesheet)
      stylesheetAttached = true
    }

    this.ipcPromises = new Map()
    this.watchEventListeners = new Set()

    this.exposeWebviewMethods()
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    const node = this.getWebviewNode()

    // Make sure we keep the webview visibile toload. See handler comments for more info
    node.addEventListener('did-finish-load', this.handleFinishFirstLoad)

    // Bind webview events
    this.updateEventListeners()

    // Create an artificial onWebContentsAttached event
    electron.remote.getCurrentWebContents().on('did-attach-webview', this.handleWebContentsAttached)
  }

  componentWillUnmount () {
    electron.remote.getCurrentWebContents().removeListener('did-attach-webview', this.handleWebContentsAttached)
  }

  componentWillReceiveProps (nextProps) {
    this.updateAttributes(nextProps)
    this.updateEventListeners()
  }

  /* **************************************************************************/
  // Internal event handlers
  /* **************************************************************************/

  /**
  * We force the style to be visible when first loaded to deal with https://github.com/electron/electron/issues/8505
  * Once did-finish-load is fired we remove our override to allow normal behaviour.
  * "did-finish-load" callback is added in componentDidMount
  */
  handleFinishFirstLoad = () => {
    const node = this.getWebviewNode()
    node.classList.remove('first-load-incomplete')
    node.removeEventListener('did-finish-load', this.handleFinishFirstLoad)
  }

  /**
  * Handles a webcontents attaching to the dom
  * @param evt: the event that fired
  * @param wc: the webcontents that did attach
  */
  handleWebContentsAttached = (evt, wc) => {
    const node = this.getWebviewNode()
    const nwc = node.getWebContents()
    if (nwc && wc.id === nwc.id) {
      if (this.props.onWebContentsAttached) {
        this.props.onWebContentsAttached(wc)
      }
      electron.remote.getCurrentWebContents().removeListener('did-attach-webview', this.handleWebContentsAttached)
    }
  }

  /* **************************************************************************/
  // Attrs
  /* **************************************************************************/

  /**
  * Updates the attributed on the dom element
  * @param the next props to pass to the element
  */
  updateAttributes (nextProps) {
    const changed = SUPPORTED_ATTRS.filter((name) => this.props[name] !== nextProps[name])
    if (changed.length) {
      const node = this.getWebviewNode()
      changed.forEach((name) => {
        node.setAttribute(name, nextProps[name] || '')
      })
    }
  }

  /**
  * Generates a string of attributes to apply to the dom element
  * @param props: the props to use
  * @param style: the style string to apply
  * @param className: the className to apply
  * @return the attributes string
  */
  generateAttributesString (props, className) {
    return SUPPORTED_ATTRS
      .filter((k) => props[k] !== undefined && props[k] !== false)
      .map((k) => {
        return `${k}="${props[k]}"`
      })
      .concat([`class="${className}"`])
      .join(' ')
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  /**
  * Automatically exposes the webview calls to the react element
  */
  exposeWebviewMethods () {
    WEBVIEW_METHODS.forEach((m) => {
      if (this[m] !== undefined) { return } // Allow overwriting
      this[m] = (...args) => {
        const node = this.getWebviewNode()
        return node[m](...args)
      }
    })
  }

  /* **************************************************************************/
  // Events
  /* **************************************************************************/

  /**
  * Updates the event listeners from the current props
  */
  updateEventListeners = () => {
    const node = this.getWebviewNode()
    WEBVIEW_EVENTS.forEach((domName) => {
      const isListening = this.watchEventListeners.has(domName)
      const hasReactListener = !!this.props[camelCase(domName)] || INTERCEPTED_WEBVIEW_EVENTS.has(domName)

      if (isListening !== hasReactListener) {
        if (isListening && !hasReactListener) {
          node.removeEventListener(domName, this.handleWebviewEvent)
        } else if (!isListening && hasReactListener) {
          node.addEventListener(domName, this.handleWebviewEvent)
        }
      }
    })
  }

  /**
  * Dispatches a webview event to the appropriate handler
  * @param domEventName: the name of the dom event
  * @param evt: the event that fired
  */
  handleWebviewEvent = (evt) => {
    const reactEventName = camelCase(evt.type)
    // Ensure you add these into INTERCEPTED_WEBVIEW_EVENTS
    if (evt.type === 'ipc-message') {
      const didSiphon = this.siphonIPCMessage(evt)
      if (!didSiphon) {
        if (this.props[reactEventName]) { this.props[reactEventName](evt) }
      }
    } else if (evt.type === 'console-message') {
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
      if (this.props[reactEventName]) { this.props[reactEventName](evt) }
    } else {
      if (this.props[reactEventName]) { this.props[reactEventName](evt) }
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
      if (this.ipcPromises.has(evt.channel.type)) {
        const responder = this.ipcPromises.get(evt.channel.type)
        clearTimeout(responder.timeout)
        responder.resolve(evt.channel.data)
        this.ipcPromises.delete(evt.channel.type)
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
  * Focuses the webview, only if not in focus already. Always check the focus
  * state first to prevent issues such as https://github.com/wavebox/waveboxapp/issues/660
  * @return true if focused, false otherwise
  */
  focus = () => {
    const node = this.getWebviewNode()
    if (document.activeElement !== node) {
      node.focus()
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
      if (node.classList.contains('capture-in-progress')) {
        arg2(null, new Error('Failed to capture, capture already in progress'))
      }

      // Attach a style to the page that can't be overwritten in case anyone else
      // tries to change the style in the meatime
      node.classList.add('capture-in-progress')

      const timeoutWarn = setTimeout(() => {
        console.warn(
          `Calling webview.capturePage is taking more than ${WARN_CAPTURE_PAGE_TIMEOUT}ms.`,
          `This can be indicitive of an error or if the api is never going to return.`,
          node
        )
      }, WARN_CAPTURE_PAGE_TIMEOUT)
      const timeout = setTimeout(() => {
        console.error(
          `Calling webview.capturePage is taking more than ${MAX_CAPTURE_PAGE_TIMEOUT}ms.`,
          `This call has been aborted as there is a risk the api is never going to return.`,
          node
        )
        arg2(null, new Error(`Failed to capture. Took more that ${MAX_CAPTURE_PAGE_TIMEOUT}`))
      }, MAX_CAPTURE_PAGE_TIMEOUT)

      // Run the capture
      setTimeout(() => {
        try {
          node.capturePage(arg1, (img) => {
            clearTimeout(timeoutWarn)
            clearTimeout(timeout)
            setTimeout(() => {
              node.classList.remove('capture-in-progress')
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
        this.ipcPromises.delete(respondName)
        reject(new Error('Request Timeout'))
      }, timeout)
      this.ipcPromises.set(respondName, { resolve: resolve, timeout: rejectTimeout })
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
    // we never want to re-render. We will handle this manually in componentWillReceiveProps
    return false
  }

  render () {
    const attrs = this.generateAttributesString(
      this.props,
      'first-load-incomplete'
    )

    return (
      <div className={'RC-WebView-Root'} dangerouslySetInnerHTML={{
        __html: `<webview ${attrs}></webview>`
      }} />
    )
  }
}

export default WebView
