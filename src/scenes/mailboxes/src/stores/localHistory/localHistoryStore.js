import RendererLocalHistoryStore from 'shared/AltStores/LocalHistory/RendererLocalHistoryStore'
import { STORE_NAME } from 'shared/AltStores/LocalHistory/AltLocalHistoryIdentifiers'
import alt from '../alt'
import actions from './localHistoryActions' // eslint-disable-line
class LocalHistoryStore extends RendererLocalHistoryStore { }
export default alt.createStore(LocalHistoryStore, STORE_NAME)
