import alt from '../alt'
import {
  CRExtensionRTActions,
  bindIPCListeners
} from 'shared/AltStores/CRExtensionRT/CRExtensionRTActions'
import { ipcRenderer } from 'electron'

const actions = alt.createActions(CRExtensionRTActions)
bindIPCListeners(ipcRenderer, actions)
export default actions
