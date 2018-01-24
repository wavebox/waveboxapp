import RendererCRExtensionRTStore from 'shared/AltStores/CRExtensionRT/RendererCRExtensionRTStore'
import { STORE_NAME } from 'shared/AltStores/RendererCRExtensionRT/AltCRExtensionRTIdentifiers'
import alt from '../alt'
import actions from './crextensionRTActions' // eslint-disable-line

class CRExtensionRTStore extends RendererCRExtensionRTStore { }

export default alt.createStore(CRExtensionRTStore, STORE_NAME)
