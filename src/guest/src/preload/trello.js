const elconsole = require('../elconsole')
try {
  const TrelloDefaultService = require('../Trello/TrelloDefaultService')
  /*eslint-disable */
  const trelloDefaultService = new TrelloDefaultService()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
