const { remote } = require('electron')
const escapeHTML = remote.require('escape-html')

class GmailApi {
  /**
  * Gets the unread count
  * @return the count or zero if not found
  */
  static getUnreadCount () {
    const element = document.querySelector('div[role=navigation] [href*="#inbox"]')
    if (element && element.textContent.indexOf('(') !== -1) {
      return parseInt(element.textContent.split(':')[0].replace(/[^0-9]/g, ''))
    }
    return 0
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param data: the data that was sent with the event
  */
  static composeMessage (data) {
    // Open the compose window
    const composeButton = document.querySelector('.T-I.J-J5-Ji.T-I-KE.L3')
    if (!composeButton) { return }

    const downEvent = document.createEvent('MouseEvents')
    downEvent.initEvent('mousedown', true, false)
    composeButton.dispatchEvent(downEvent)

    const upEvent = document.createEvent('MouseEvents')
    upEvent.initEvent('mouseup', true, false)
    composeButton.dispatchEvent(upEvent)

    if (data.recipient || data.subject || data.body) {
      setTimeout(() => {
        // Grab elements
        const subjectEl = Array.from(document.querySelectorAll('[name="subjectbox"]')).slice(-1)[0]
        if (!subjectEl) { return }
        const dialogEl = subjectEl.closest('[role="dialog"]')
        if (!dialogEl) { return }
        const bodyEl = dialogEl.querySelector('[g_editable="true"][role="textbox"]')
        const recipientEl = dialogEl.querySelector('[name="to"]')
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
          focusableEl = bodyEl
        }

        if (focusableEl) {
          setTimeout(() => focusableEl.focus(), 500)
        }
      })
    }
  }
}

module.exports = GmailApi
