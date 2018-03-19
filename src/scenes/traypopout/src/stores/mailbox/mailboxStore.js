import RendererMailboxStore from 'shared/AltStores/Mailbox/RendererMailboxStore'
import { STORE_NAME } from 'shared/AltStores/Mailbox/AltMailboxIdentifiers'
import alt from '../alt'
import actions from './mailboxActions' // eslint-disable-line
class MailboxStore extends RendererMailboxStore { }
export default alt.createStore(MailboxStore, STORE_NAME)
