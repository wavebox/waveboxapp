/**
* Crawls all menus out from a root menu
* @param rootMenu: the root menu
* @return an array of menus within
*/
const crawlMenus = function (rootMenu) {
  const all = [rootMenu]
  const search = Array.from(rootMenu.items)

  while (search.length) {
    const searchMenu = search.pop()
    if (searchMenu.submenu) {
      all.push(searchMenu.submenu)
      if (searchMenu.submenu.items) {
        search.push(searchMenu.submenu.items)
      }
    }
  }
  return all
}

/**
* Fully destroys a menu and all its submenus
* @param rootMenu: the root menu item
*/
const fullDestroyMenu = function (rootMenu) {
  crawlMenus(rootMenu).forEach((menu) => {
    menu.destroy()
  })
}

module.exports = {
  fullDestroyMenu: fullDestroyMenu
}
