const elconsole = require('../elconsole')
try {
  const SlackDefaultService = require('../Slack/SlackDefaultService')
  /*eslint-disable */
  const slackDefaultService = new SlackDefaultService()
  /*eslint-enable */
} catch (ex) {
  elconsole.error('Error', ex)
}
