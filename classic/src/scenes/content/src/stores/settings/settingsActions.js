import RendererSettingsActions from 'shared/AltStores/Settings/RendererSettingsActions'
import subActionsFactory from 'shared/AltStores/Settings/SettingsSubActions'
import alt from '../alt'

class SettingsActions extends RendererSettingsActions { }

const actions = alt.createActions(SettingsActions)
actions.sub = subActionsFactory(actions)

export default actions
