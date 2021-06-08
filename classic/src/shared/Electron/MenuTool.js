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
* Crawls all menus out from a root menu
* @param rootMenu: the root menu
* @return an array of menus items within
*/
const crawlMenuItems = function (rootMenu) {
  return crawlMenus(rootMenu).reduce((acc, menu) => {
    return acc.concat(menu.items)
  }, [])
}

/**
* Fully destroys a menu and all its submenus
* @param rootMenu: the root menu item
*/
const fullDestroyMenu = function (rootMenu) {
  console.warn([
    'MenuTool.fullDestroyMenu is depricated you should just use "menu.destroy()" instead.',
    'The original issue (electron#9823) that this worked around is fixed in electron>=2.0.0'
  ].join('\n'))
  crawlMenus(rootMenu).forEach((menu) => {
    menu.destroy()
  })
}

/**
* Gets all the menu items that have an accelerator set
* @param rootMenu: the root menu item
* @return a list of all menu items that have accelerators
*/
const allAcceleratorMenuItems = function (rootMenu) {
  return crawlMenuItems(rootMenu).filter((menu) => {
    return !!menu.accelerator
  })
}

module.exports = {
  fullDestroyMenu: fullDestroyMenu,
  allAcceleratorMenuItems: allAcceleratorMenuItems
}
