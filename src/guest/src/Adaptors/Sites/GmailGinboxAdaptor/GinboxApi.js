import escapeHTML from 'escape-html'
import { ipcRenderer } from 'electron'
import { WCRPC_SEND_INPUT_EVENTS } from 'shared/webContentsRPC'

class GinboxApi {
  /**
  * @return true if the API is ready
  */
  static isReady () { return document.readyState === 'complete' }

  /**
  * Gets the visible unread count. Ensures that clusters are only counted once/
  * May throw a dom exception if things go wrong
  * @return the unread count
  */
  static getVisibleUnreadCount () {
    const unread = Array.from(document.querySelectorAll('[data-item-id] [email]')).reduce((acc, elm) => {
      const isUnread = elm.tagName !== 'IMG' && window.getComputedStyle(elm).fontWeight === 'bold'
      if (isUnread) {
        const clusterElm = elm.closest('[data-item-id^="#clusters"]')
        if (clusterElm) {
          acc.openClusters.add(clusterElm)
        } else {
          acc.messages.add(elm)
        }
      }
      return acc
    }, { messages: new Set(), openClusters: new Set() })
    return unread.messages.size + unread.openClusters.size
  }

  /**
  * Checks if the inbox tab is visble
  * May throw a dom exception if things go wrong
  * @return true or false
  */
  static isInboxTabVisible () {
    const elm = document.querySelector('nav [role="menuitem"]') // The first item
    return window.getComputedStyle(elm).backgroundColor.substr(-4) !== ', 0)'
  }

  /**
  * Checks if the pinned setting is toggled
  * May throw a dom exception if things go wrong
  * @return true or false
  */
  static isInboxPinnedToggled () {
    const elm = document.querySelector('[jsaction="global.toggle_pinned"]')
    return elm ? elm.getAttribute('aria-pressed') === 'true' : false
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param data: the data that was sent with the event
  * @return promise with true if compose was a success, false otherwise
  */
  static composeMessage (data) {
    return new Promise((resolve, reject) => {
      const composeButton = document.querySelector('button.y.hC') || document.querySelector('[jsaction="jsl._"]')
      if (!composeButton) {
        resolve(false)
        return
      }
      composeButton.click()

      // If mixmax is used we can't talk into the compose window because it's in a nested iframe.
      // If we don't return that we we're successfull though we end up in a nasty state where
      // we keep hitting compose. Fail gracefully getting as far as we can
      if (composeButton.classList.contains('mixmax-compose-button')) {
        resolve(true)
        return
      }

      setTimeout(() => {
        // Grab elements
        const bodyEl = document.querySelector('[g_editable="true"][role="textbox"]')
        if (!bodyEl) {
          resolve(false)
          return
        }
        const dialogEl = bodyEl.closest('[role="dialog"]')
        if (!dialogEl) {
          resolve(false)
          return
        }
        const recipientEl = dialogEl.querySelector('input') // first input
        const subjectEl = dialogEl.querySelector('[jsaction*="subject"]')
        let focusableEl

        // Recipient
        if (data.recipient && recipientEl) {
          recipientEl.value = escapeHTML(data.recipient)
          focusableEl = subjectEl
        }

        // Subject
        if (data.subject && subjectEl) {
          subjectEl.value = escapeHTML(data.subject)
          focusableEl = bodyEl
        }

        // Body
        if (data.body && bodyEl) {
          bodyEl.innerHTML = escapeHTML(data.body) + bodyEl.innerHTML
          const labelEl = bodyEl.parentElement.querySelector('label')
          if (labelEl) { labelEl.style.display = 'none' }
          focusableEl = bodyEl
        }

        if (focusableEl) {
          setTimeout(() => focusableEl.focus(), 500)
        }
        resolve(true)
      }, 250)
    })
  }

  /**
  * Starts a search
  * @param term: the term to search for
  * @param completeFn=undefined: executed on completion
  */
  static startSearch (term, completeFn = undefined) {
    const element = document.querySelector('[role="search"] input')
    element.value = term
    element.dispatchEvent(new window.Event('input', { bubbles: true, cancelable: true }))
    if (completeFn) {
      setTimeout(() => { completeFn() })
    }
  }

  /**
  * Clears the search items
  * @param completeFn=undefined: executed on complete
  */
  static clearSearchItems (completeFn) {
    const element = document.querySelector('[role="search"] input')
    if (!element.value) {
      if (completeFn) { completeFn() }
    } else {
      this.startSearch('', () => {
        const retry = 100
        const timeout = 2000
        const start = new Date().getTime()
        const interval = setInterval(() => {
          if (new Date().getTime() > start + timeout) {
            clearInterval(interval)
            if (completeFn) { completeFn() }
          } else {
            const element = Array.from(document.querySelectorAll('[jsaction*="search.toggle_item"]'))
              .find((el) => !!el.offsetParent)
            if (!element) {
              clearInterval(interval)
              if (completeFn) { completeFn() }
            }
          }
        }, retry)
      })
    }
  }

  /**
  * Opens the first search item
  * @param timeout=2000: timeout in ms to keep retrying
  * @param retry=100: time to wait between retries
  * @param completeFn=undefined: given when the element is clicked. Provided with true click was a success, false otherwise
  * @return the setInterval timeout. If cancelled cb will not execute
  */
  static openFirstSearchItem (timeout = 2000, retry = 100, completeFn = undefined) {
    const start = new Date().getTime()
    const interval = setInterval(() => {
      if (new Date().getTime() > start + timeout) {
        clearInterval(interval)
        if (completeFn) { completeFn(false) }
      } else {
        const element = Array.from(document.querySelectorAll('[jsaction*="search.toggle_item"]'))
          .find((el) => !!el.offsetParent)
        if (element) {
          clearInterval(interval)
          const rect = element.getBoundingClientRect()
          ipcRenderer.send(WCRPC_SEND_INPUT_EVENTS, [
            {
              type: 'mouseDown',
              x: rect.left + 1,
              y: rect.top + 1,
              button: 'left',
              clickCount: 1
            },
            {
              type: 'mouseUp',
              x: rect.left + 1,
              y: rect.top + 1,
              button: 'left',
              clickCount: 1
            }
          ])
          if (completeFn) { completeFn(true) }
        }
      }
    }, retry)
    return interval
  }
}

export default GinboxApi
