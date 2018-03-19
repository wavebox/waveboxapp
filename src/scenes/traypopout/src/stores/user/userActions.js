import RendererUserActions from 'shared/AltStores/User/RendererUserActions'
import alt from '../alt'
class UserActions extends RendererUserActions { }
const actions = alt.createActions(UserActions)
export default actions
