import RendererEmblinkStore from 'shared/AltStores/Emblink/RendererEmblinkStore'
import { STORE_NAME } from 'shared/AltStores/Emblink/AltEmblinkIdentifiers'
import alt from '../alt'
import actions from './emblinkActions' // eslint-disable-line
class EmblinkStore extends RendererEmblinkStore { }
export default alt.createStore(EmblinkStore, STORE_NAME)
