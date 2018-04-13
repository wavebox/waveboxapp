import escapeHTML from 'escape-html'
import { webFrame } from 'electron'

class GmailApi {
  /**
  * Checks if we're using material UI
  * @param callback: executed on completion. Provided with true if we're using material UI
  */
  static isMaterialUI (callback) {
    webFrame.executeJavaScript('window.GM_RFT_ENABLED', (res) => {
      const isMaterialUI = res === 'true'
      callback(isMaterialUI)
    })
  }

  /**
  * Gets the unread count
  * @return the count or zero if not found
  */
  static getUnreadCount () {
    const element = document.querySelector('div[role=navigation] [href*="#inbox"]')
    if (element) {
      let text
      if (element.getAttribute('title').indexOf('(') !== -1) {
        text = element.getAttribute('title') // Material & non-material
      } else if (element.textContent.indexOf('(') !== -1) {
        text = element.textContent // Fallback
      }

      if (text) {
        const count = parseInt((text.split(':')[0] || '').replace(/[^0-9]/g, ''))
        if (!isNaN(count)) {
          return count
        }
      }
    }

    return 0
  }

  /**
  * Gets the compose elements out the dom from the newest compose window
  * @return { subject, dialog, body, recipient } or undefined if not available
  */
  static getNewestComposeElements () {
    const subjectEl = Array.from(document.querySelectorAll('[name="subjectbox"]')).slice(-1)[0]
    if (!subjectEl) { return undefined }

    const dialogEl = subjectEl.closest('[role="dialog"]')
    if (!dialogEl) { return undefined }

    const bodyEl = dialogEl.querySelector('[g_editable="true"][role="textbox"]')
    const recipientEl = dialogEl.querySelector('[name="to"]')

    return {
      subject: subjectEl,
      dialog: dialogEl,
      body: bodyEl,
      recipient: recipientEl
    }
  }

  /**
  * Populates the compose window
  * @param recipient: the recipient to place in the input element
  * @param subject: the subject to place in the input element
  * @param body: the body to place in the input element
  * @return true if population was successful, false otherwise
  */
  static populateNewestComposeWindow (recipient, subject, body) {
    const elements = this.getNewestComposeElements()
    if (!elements) { return false }

    let focusOn

    // Recipient
    if (recipient && elements.recipient) {
      elements.recipient.value = escapeHTML(recipient)
      focusOn = elements.subject
    }

    // Subject
    if (subject && elements.subject) {
      elements.subject.value = escapeHTML(subject)
      focusOn = elements.body
    }

    // Body
    if (body && elements.body) {
      elements.body.innerHTML = escapeHTML(body) + elements.body.innerHTML
      focusOn = elements.body
    }

    if (focusOn) {
      setTimeout(() => focusOn.focus(), 500)
    }
    return true
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param data: the data that was sent with the event
  * @return true if compose was a success, false otherwise
  */
  static composeMessage (data) {
    // Open the compose window
    const composeButton = document.querySelector('.T-I.J-J5-Ji.T-I-KE.L3')
    if (!composeButton) { return false }

    const downEvent = document.createEvent('MouseEvents')
    downEvent.initEvent('mousedown', true, false)
    composeButton.dispatchEvent(downEvent)

    const upEvent = document.createEvent('MouseEvents')
    upEvent.initEvent('mouseup', true, false)
    composeButton.dispatchEvent(upEvent)

    if (data.recipient || data.subject || data.body) {
      // The dom can take a little time to update, so make sure we give it time to render the window.
      // This with retries of 20 and wait of 100 it can take up to two seconds. MaterialUI typically takes
      // 1 second-ish whilst normal ui typically takes less than 1 second
      setTimeout(() => {
        const didPopulate = this.populateNewestComposeWindow(data.recipient, data.subject, data.body)
        if (!didPopulate) {
          let retries = 0
          const retry = setInterval(() => {
            retries++
            const didPopulate = this.populateNewestComposeWindow(data.recipient, data.subject, data.body)
            if (didPopulate || retries > 20) { clearInterval(retry) }
          }, 100)
        }
      }, 1)
    }

    return true
  }
}

export default GmailApi
