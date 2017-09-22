import alt from '../alt'
import actions from './crextensionActions'
import CRExtensionRTStore from 'shared/AltStores/CRExtensionRT/CRExtensionRTStore'
import { ipcRenderer } from 'electron'

export default alt.createStore(CRExtensionRTStore, 'CRExtension', ipcRenderer, actions)
