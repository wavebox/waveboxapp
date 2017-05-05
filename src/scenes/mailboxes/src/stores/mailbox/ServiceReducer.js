import { MAILBOX_SLEEP_WAIT } from 'shared/constants'

class ServiceReducer {
  /* **************************************************************************/
  // Behaviour
  /* **************************************************************************/

  /**
  * Toggles the service sleepable state
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param sleepable: true if the service is sleepable, false otherwise
  */
  static setSleepable (mailbox, service, sleepable) {
    return service.changeData({ sleepable: sleepable })
  }

  /**
  * Sets the time before sleeping
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param timeout: the new timeout to set in millis
  */
  static setSleepableTimeout (mailbox, service, timeout) {
    const min = 1000 // 1 sec
    const max = 6000 * 1000 // 100 minutes

    let value = parseInt(timeout)
    value = isNaN(value) ? MAILBOX_SLEEP_WAIT : value
    value = Math.min(Math.max(timeout, min), max)
    return service.changeData({ sleepableTimeout: value })
  }

  /* **************************************************************************/
  // Zoom
  /* **************************************************************************/

  /**
  * Increases the zoom of the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static increaseZoom (mailbox, service) {
    return service.changeData({
      zoomFactor: Math.min(1.5, service.zoomFactor + 0.1)
    })
  }

  /**
  * Decreases the zoom of the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static decreaseZoom (mailbox, service) {
    return service.changeData({
      zoomFactor: Math.max(0.5, service.zoomFactor - 0.1)
    })
  }

  /**
  * Resets the zoom of the the active mailbox
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  */
  static resetZoom (mailbox, service) {
    return service.changeData({ zoomFactor: 1.0 })
  }

  /* **************************************************************************/
  // Custom Code
  /* **************************************************************************/

  /**
  * Sets the custom css
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param css: the css code
  */
  static setCustomCSS (mailbox, service, css) {
    return service.changeData({ customCSS: css })
  }

  /**
  * Sets the custom js
  * @param mailbox: the mailbox that contains the service
  * @param service: the service to update
  * @param js: the js code
  */
  static setCustomJS (mailbox, service, js) {
    return service.changeData({ customJS: js })
  }
}

export default ServiceReducer
