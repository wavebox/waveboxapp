import { ipcMain, webContents } from 'electron'
import CRDispatchManager from '../CRDispatchManager'
import CRExtensionUISubscriber from '../CRExtensionUISubscriber'
import {
  CRX_CONTEXT_MENU_CREATE_,
  CRX_CONTEXT_MENU_CLICKED_
} from 'shared/crExtensionIpcEvents'
import {
  WBECRX_CONTEXT_MENUS_CHANGED,
  WBECRX_CONTEXT_MENU_ITEM_CLICKED_
} from 'shared/ipcEvents'
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
    ipcMain.on(`${WBECRX_CONTEXT_MENU_ITEM_CLICKED_}${this.extension.id}`, this.handleClick)
  }

  destroy () {
    CRDispatchManager.unregisterHandler(`${CRX_CONTEXT_MENU_CREATE_}${this.extension.id}`, this.handleCreateMenu)
    ipcMain.removeListener(`${WBECRX_CONTEXT_MENU_ITEM_CLICKED_}${this.extension.id}`, this.handleClick)
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
    CRExtensionUISubscriber.send(WBECRX_CONTEXT_MENUS_CHANGED, this.extension.id, this.buildUIRuntimeData())
    responseCallback(null, undefined)
  }

  /* ****************************************************************************/
  // Handlers: UI Events
  /* ****************************************************************************/

  /**
  * Handles the user clicking on a context menu action
  * @param evt: the event that fired
  * @param tabId: the id of the tab that fired the event
  * @param params: the click params
  */
  handleClick = (evt, tabId, params) => {
    webContents.getAllWebContents().forEach((targetWebcontents) => {
      targetWebcontents.sendToAll(`${CRX_CONTEXT_MENU_CLICKED_}${this.extension.id}`, tabId, params)
    })
  }
}

export default CRExtensionContextMenus
