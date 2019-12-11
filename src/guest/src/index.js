import { Browser } from 'Browser'
import Adaptors from './Adaptors'
import IEngine from './IEngine'
import elconsole from 'elconsole'
import ElectronPolyfill from './ElectronPolyfill'
import CrashReporter from './CrashReporter'
import { ipcRenderer } from 'electron'

let browser
let adaptors
let iengine
try {
  ElectronPolyfill.polyfill()
  browser = new Browser()
  browser.start()
  adaptors = new Adaptors()
  adaptors.start()
  iengine = new IEngine()
  iengine.start()
} catch (ex) {
  elconsole.error(`Failed to execute preload script:\n${ex}`)
  console.error(`Failed to execute preload script`, ex)
}

let crashReporter
try {
  crashReporter = new CrashReporter()
  crashReporter.start()
} catch (ex) {
  elconsole.error(`Failed to start crash reporter:\n${ex}`)
  console.error(`Failed to start crash reporter`, ex)
}

ipcRenderer.on('WB_WCFETCH_SERVICE_TEXT_RUNNER', (evt, channel, url, options) => {
  Promise.resolve()
    .then(() => window.fetch(url, options))
    .then((res) => {
      res.text().then((body) => {
        ipcRenderer.send(channel, {
          ok: res.ok,
          status: res.status,
          body: body
        })
      })
    })
})
