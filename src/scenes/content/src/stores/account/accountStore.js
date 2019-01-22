import RendererAccountStore from 'shared/AltStores/Account/RendererAccountStore'
import { STORE_NAME } from 'shared/AltStores/Account/AltAccountIdentifiers'
import alt from '../alt'
import actions from './accountActions' // eslint-disable-line
class AccountStore extends RendererAccountStore { }
export default alt.createStore(AccountStore, STORE_NAME)
