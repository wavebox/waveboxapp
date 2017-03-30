module.exports = {
  mailboxActions: require('./mailboxActions'),
  mailboxStore: require('./mailboxStore'),
  mailboxDispatch: require('./mailboxDispatch'),
  MailboxLinker: require('./MailboxLinker'),

  MailboxReducer: require('./MailboxReducer'),
  ServiceReducer: require('./ServiceReducer'),
  GenericMailboxReducer: require('./GenericMailboxReducer'),
  GenericDefaultServiceReducer: require('./GenericDefaultServiceReducer'),
  GoogleMailboxReducer: require('./GoogleMailboxReducer'),
  GoogleDefaultServiceReducer: require('./GoogleDefaultServiceReducer'),
  SlackMailboxReducer: require('./SlackMailboxReducer'),
  SlackDefaultServiceReducer: require('./SlackDefaultServiceReducer'),
  TrelloMailboxReducer: require('./TrelloMailboxReducer'),
  TrelloDefaultServiceReducer: require('./TrelloDefaultServiceReducer'),
  MicrosoftMailboxReducer: require('./MicrosoftMailboxReducer'),
  MicrosoftDefaultServiceReducer: require('./MicrosoftDefaultServiceReducer'),
  MicrosoftStorageServiceReducer: require('./MicrosoftStorageServiceReducer')
}
