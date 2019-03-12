import React from 'react'
import ReactDOM from 'react-dom'
import { ELEVATED_LOG_PREFIX } from 'shared/constants'
import electron from 'electron'
import camelCase from './camelCase'
import WebViewGroupEventDispatcher from './WebViewGroupEventDispatcher'
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
const INTERCEPTED_WEBVIEW_EVENTS = new Set([
  'ipc-message',
  'console-message',
  'dom-ready',
  'did-attach'
])

let stylesheetAttached = false
const stylesheet = document.createElement('style')
stylesheet.innerHTML = `
  .RC-WebView-Root { position:absolute; top:0; left:0; right:0; bottom:0; }
  .RC-WebView-Root>webview { position:absolute; top:0; left:0; right:0; bottom:0; }
  .RC-WebView-Root>webview.first-load-incomplete { visibility: visible !important; }
  .RC-WebView-Root>webview.capture-in-progress { visibility: visible !important; }
`

const privIpcPromises = Symbol('privIpcPromises')
const privWatchEventListener = Symbol('privWatchEventListener')
const privWebviewAttached = Symbol('privWebviewAttached')

class WebView extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/
  static propTypes = {
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

    this[privIpcPromises] = new Map()
    this[privWatchEventListener] = new Set()
    this[privWebviewAttached] = false

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

    WebViewGroupEventDispatcher.on('window-focus', this.handleWindowFocused)
  }

  componentWillUnmount () {
    WebViewGroupEventDispatcher.removeListener('window-focus', this.handleWindowFocused)
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
  * Handles the window coming into focus
  * @param evt: the event that fired
  */
  handleWindowFocused = (evt) => {
    const node = this.getWebviewNode()
    if (document.activeElement === node) {
      // There's an issue where the mouse hover state is incorrectly reported to the child window.
      // It's not 100% reproducable but is more reproducable when all these are true:,
      // gmail, darwin, multiple extensions, switching via keyboard, switching from another desktop
      //
      // Bluring the element, focusing on another and focusing back on next tick seems to fix it
      // but has the nasty side-effect of causing webviews with a focused iframe to maintain pragmatic
      // focus but actually not hold focus
      //
      // An alternative fix for this is to force a repaint. You can either do this by visibility=hidden/visible
      // or by changing the physical dimensions on the element. By changing by 0.1px it causes a reflow and repaint
      // of the dom but the user should not see the size change because chromium will round down (Unless you have a
      // monitor with 10x pixel density).
      const sizeBackFn = () => {
        node.removeEventListener('resize', sizeBackFn)
        setTimeout(() => {
          node.style.top = '0px'
        })
      }
      node.addEventListener('resize', sizeBackFn)
      node.style.top = '0.1px'
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
      const isListening = this[privWatchEventListener].has(domName)
      const hasReactListener = !!this.props[camelCase(domName)] || INTERCEPTED_WEBVIEW_EVENTS.has(domName)

      if (isListening !== hasReactListener) {
        if (isListening && !hasReactListener) {
          node.removeEventListener(domName, this.handleWebviewEvent)
          this[privWatchEventListener].delete(domName)
        } else if (!isListening && hasReactListener) {
          if (domName === 'will-navigate') {
            /**
            * @Thomas101 for more info...
            * This is work around will-navigating not firing reliably for webContents. As in
            * electron/issues/14751
            */
            console.warn([
              `"willNavigate" is has been depricated in Wavebox that uses Electron 3.0+ as it fires intermittently.`,
              `  Use "didStartNavigation" instead as it provides more reliable functionality in the renderer thread`
            ].join(' '), this.getWebviewNode())
          }
          node.addEventListener(domName, this.handleWebviewEvent)
          this[privWatchEventListener].add(domName)
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
    } else if (evt.type === 'dom-ready') {
      // Workaround as in https://github.com/electron/electron/issues/14474
      // Fixes the cursor position not being shown when re-focusing tabs
      // Reproduction case:
      // 1. Gmail account, (https://wavebox.io/support) account
      // 2. Launch app, switch to wb account
      // 3. Click in support box type. You can type, but no cursor and no focus highlighting
      const node = this.getWebviewNode()
      if (document.activeElement === node) {
        node.blur()
        node.focus()
      }
      if (this.props[reactEventName]) { this.props[reactEventName](evt) }
    } else if (evt.type === 'did-attach') {
      this[privWebviewAttached] = true
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
      if (this[privIpcPromises].has(evt.channel.type)) {
        const responder = this[privIpcPromises].get(evt.channel.type)
        clearTimeout(responder.timeout)
        responder.resolve(evt.channel.data)
        this[privIpcPromises].delete(evt.channel.type)
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
    // Calling focus on an active element can cause weird behaviour, for example requring a double
    // click in the webview. Check to see if the element is focused first.
    // Fixes https://github.com/wavebox/waveboxapp/issues/660
    if (document.activeElement !== node) {
      // Workaround as in https://github.com/electron/electron/issues/15718
      // Starting with electron 3 switching between loaded webviews would cause odd things
      // to happen. Focus wouldn't be transferred. Accelerators would fail to work. To work
      // around this, call blur on the active element first. Don't know why it works but it does
      document.activeElement.blur()
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
          node.getWebContents().capturePage(arg1, (img) => {
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
        this[privIpcPromises].delete(respondName)
        reject(new Error('Request Timeout'))
      }, timeout)
      this[privIpcPromises].set(respondName, { resolve: resolve, timeout: rejectTimeout })
      this.getWebviewNode().send(sendName, { ...obj, __respond__: respondName })
    })
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * @return the webview node
  */
  getWebviewNode = () => {
    return ReactDOM.findDOMNode(this).getElementsByTagName('webview')[0]
  }

  /**
  * @return true if the webview is attached
  */
  isWebviewAttached = () => {
    return this[privWebviewAttached]
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

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
