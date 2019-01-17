import RendererLocalHistoryActions from 'shared/AltStores/LocalHistory/RendererLocalHistoryActions'
import alt from '../alt'
class LocalHistoryActions extends RendererLocalHistoryActions { }
const actions = alt.createActions(LocalHistoryActions)
export default actions
