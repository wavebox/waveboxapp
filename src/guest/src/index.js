import {Browser} from 'Browser'
import Adaptors from './Adaptors'
import elconsole from 'elconsole'

let browser
let adaptors
try {
  browser = new Browser()
  browser.start()
  adaptors = new Adaptors()
  adaptors.start()
} catch (ex) {
  elconsole.error(`Failed to execute preload script:\n${ex}`)
  console.error(`Failed to execute preload script`, ex)
}
