import RendererSettingsStore from 'shared/AltStores/Settings/RendererSettingsStore'
import { STORE_NAME } from 'shared/AltStores/Settings/AltSettingsIdentifiers'
import alt from '../alt'
import actions from './settingsActions' // eslint-disable-line

class SettingsStore extends RendererSettingsStore { }

export default alt.createStore(SettingsStore, STORE_NAME)
