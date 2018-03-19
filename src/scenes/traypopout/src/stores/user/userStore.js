import RendererUserStore from 'shared/AltStores/User/RendererUserStore'
import { STORE_NAME } from 'shared/AltStores/User/AltUserIdentifiers'
import alt from '../alt'
import actions from './userActions' // eslint-disable-line
class UserStore extends RendererUserStore { }
export default alt.createStore(UserStore, STORE_NAME)
