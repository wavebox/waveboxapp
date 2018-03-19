import RendererNotifhistStore from 'shared/AltStores/Notifhist/RendererNotifhistStore'
import { STORE_NAME } from 'shared/AltStores/Notifhist/AltNotifhistIdentifiers'
import alt from '../alt'
import actions from './notifhistActions' // eslint-disable-line
class NotifhistStore extends RendererNotifhistStore { }
export default alt.createStore(NotifhistStore, STORE_NAME)
