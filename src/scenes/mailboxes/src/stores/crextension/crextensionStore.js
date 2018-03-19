import RendererCRExtensionStore from 'shared/AltStores/CRExtension/RendererCRExtensionStore'
import { STORE_NAME } from 'shared/AltStores/CRExtension/AltCRExtensionIdentifiers'
import alt from '../alt'
import actions from './crextensionActions' // eslint-disable-line

class CRExtensionStore extends RendererCRExtensionStore { }

export default alt.createStore(CRExtensionStore, STORE_NAME)
