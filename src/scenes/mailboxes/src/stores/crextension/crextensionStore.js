import alt from '../alt'
import actions from './crextensionActions'
import CRExtensionRTStore from 'shared/AltStores/CRExtensionRT/CRExtensionRTStore'
const { ipcRenderer } = window.nativeRequire('electron')

export default alt.createStore(CRExtensionRTStore, 'CRExtension', ipcRenderer, actions)
