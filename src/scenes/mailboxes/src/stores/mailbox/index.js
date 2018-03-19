import mailboxActions from './mailboxActions'
import mailboxStore from './mailboxStore'
import mailboxDispatch from './mailboxDispatch'
import MailboxLinker from './MailboxLinker'
import {
  MailboxReducer,
  ServiceReducer,
  GenericMailboxReducer,
  GenericDefaultServiceReducer,
  GoogleMailboxReducer,
  GoogleDefaultServiceReducer,
  GoogleCommunicationServiceReducer,
  GoogleCalendarServiceReducer,
  GoogleMessengerServiceReducer,
  GoogleTeamServiceReducer,
  SlackMailboxReducer,
  SlackDefaultServiceReducer,
  TrelloMailboxReducer,
  TrelloDefaultServiceReducer,
  MicrosoftMailboxReducer,
  MicrosoftTeamServiceReducer,
  MicrosoftDefaultServiceReducer,
  MicrosoftStorageServiceReducer,
  ContainerDefaultServiceReducer,
  ContainerMailboxReducer
} from 'shared/AltStores/Mailbox/MailboxReducers'

export {
  MailboxReducer,
  ServiceReducer,
  GenericMailboxReducer,
  GenericDefaultServiceReducer,
  GoogleMailboxReducer,
  GoogleDefaultServiceReducer,
  GoogleCommunicationServiceReducer,
  GoogleCalendarServiceReducer,
  GoogleMessengerServiceReducer,
  GoogleTeamServiceReducer,
  SlackMailboxReducer,
  SlackDefaultServiceReducer,
  TrelloMailboxReducer,
  TrelloDefaultServiceReducer,
  MicrosoftMailboxReducer,
  MicrosoftTeamServiceReducer,
  MicrosoftDefaultServiceReducer,
  MicrosoftStorageServiceReducer,
  ContainerDefaultServiceReducer,
  ContainerMailboxReducer,
  mailboxActions,
  mailboxStore,
  mailboxDispatch,
  MailboxLinker
}
