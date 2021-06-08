import RendererPlatformStore from 'shared/AltStores/Platform/RendererPlatformStore'
import { STORE_NAME } from 'shared/AltStores/Platform/AltPlatformIdentifiers'
import alt from '../alt'
import actions from './platformActions' // eslint-disable-line

class PlatformStore extends RendererPlatformStore { }

export default alt.createStore(PlatformStore, STORE_NAME)
