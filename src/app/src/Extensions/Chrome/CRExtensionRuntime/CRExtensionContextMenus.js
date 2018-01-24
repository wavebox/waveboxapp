import { webContents } from 'electron'
import CRDispatchManager from '../CRDispatchManager'
import CRExtensionTab from './CRExtensionTab'
import {
  CRX_CONTEXT_MENU_CREATE_,
  CRX_CONTEXT_MENU_CLICKED_
} from 'shared/crExtensionIpcEvents'
import {
  CRExtensionRTContextMenu
} from 'shared/Models/CRExtensionRT'

class CRExtensionContextMenus {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor (extension) {
    this.extension = extension
    this.menuItems = []

    CRDispatchManager.registerHandler(`${CRX_CONTEXT_MENU_CREATE_}${this.extension.id}`, this.handleCreateMenu)
  }

  destroy () {
    CRDispatchManager.unregisterHandler(`${CRX_CONTEXT_MENU_CREATE_}${this.extension.id}`, this.handleCreateMenu)
  }

  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * @param id: the id of the menu item
  * @return the menu item or undefined
  */
  getMenuItemWithId (id) {
    return this.menuItems.find((mi) => mi.id === id)
  }

  /**
  * Builds the runtime data for the ui
  * @return the browser actions in a plain json object
  */
  buildUIRuntimeData () {
    return this.menuItems.map((mi) => {
      return [ mi.id, mi.cloneData() ]
    })
  }

  /* ****************************************************************************/
  // Handlers: Modifying
  /* ****************************************************************************/

  /**
  * Creates a new menu
  * @param evt: the event that fired
  * @param [id, properties]: the id of the menu and the properties
  * @param responseCallback: executed on completion
  */
  handleCreateMenu = (evt, [id, properties], responseCallback) => {
    if (this.getMenuItemWithId(id)) {
      responseCallback(new Error(`Context Menu with id already exists "${id}"`))
      return
    }

    const contextMenu = new CRExtensionRTContextMenu(this.extension.id, id, properties)
    this.menuItems.push(contextMenu)
    responseCallback(null, undefined)
  }

  /* ****************************************************************************/
  // Handlers: UI Events
  /* ****************************************************************************/

  /**
  * Handles the user clicking on a context menu action
  * @param contents: the webcontents that clicked the item
  * @param params: the click params
  */
  itemSelected = (contents, params) => {
    const tabInfo = CRExtensionTab.dataFromWebContentsId(this.extension, contents.id)
    webContents.getAllWebContents().forEach((targetWebcontents) => {
      targetWebcontents.send(`${CRX_CONTEXT_MENU_CLICKED_}${this.extension.id}`, tabInfo, params)
    })
  }
}

export default CRExtensionContextMenus
