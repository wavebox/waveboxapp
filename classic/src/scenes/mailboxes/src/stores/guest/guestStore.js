import RendererGuestStore from 'shared/AltStores/Guest/RendererGuestStore'
import { STORE_NAME } from 'shared/AltStores/Guest/AltGuestIdentifiers'
import alt from '../alt'
import actions from './guestActions' // eslint-disable-line

class GuestStore extends RendererGuestStore { }

export default alt.createStore(GuestStore, STORE_NAME)
