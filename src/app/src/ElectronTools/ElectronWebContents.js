class ElectronWebContents {
  /* ****************************************************************************/
  // Getters
  /* ****************************************************************************/

  /**
  * Gets the root webcontents by crawling the hostWebContents tree
  * @param wc: the webcontents to look at
  * @return the topmost webcontents
  */
  static rootWebContents (wc) {
    let target = wc
    while (target.hostWebContents) {
      target = target.hostWebContents
    }
    return target
  }
}

export default ElectronWebContents
