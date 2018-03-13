import MailboxReducer from './MailboxReducer'
import ServiceReducer from './ServiceReducer'
import GenericMailboxReducer from './GenericMailboxReducer'
import GenericDefaultServiceReducer from './GenericDefaultServiceReducer'
import GoogleMailboxReducer from './GoogleMailboxReducer'
import GoogleDefaultServiceReducer from './GoogleDefaultServiceReducer'
import GoogleCommunicationServiceReducer from './GoogleCommunicationServiceReducer'
import GoogleCalendarServiceReducer from './GoogleCalendarServiceReducer'
import GoogleMessengerServiceReducer from './GoogleMessengerServiceReducer'
import SlackMailboxReducer from './SlackMailboxReducer'
import SlackDefaultServiceReducer from './SlackDefaultServiceReducer'
import TrelloMailboxReducer from './TrelloMailboxReducer'
import TrelloDefaultServiceReducer from './TrelloDefaultServiceReducer'
import MicrosoftMailboxReducer from './MicrosoftMailboxReducer'
import MicrosoftDefaultServiceReducer from './MicrosoftDefaultServiceReducer'
import MicrosoftStorageServiceReducer from './MicrosoftStorageServiceReducer'
import MicrosoftTeamServiceReducer from './MicrosoftTeamServiceReducer'
import ContainerDefaultServiceReducer from './ContainerDefaultServiceReducer'
import ContainerMailboxReducer from './ContainerMailboxReducer'

const REDUCER_CLASSES = [
  MailboxReducer,
  ServiceReducer,
  GenericMailboxReducer,
  GenericDefaultServiceReducer,
  GoogleMailboxReducer,
  GoogleDefaultServiceReducer,
  GoogleCommunicationServiceReducer,
  GoogleCalendarServiceReducer,
  GoogleMessengerServiceReducer,
  SlackMailboxReducer,
  SlackDefaultServiceReducer,
  TrelloMailboxReducer,
  TrelloDefaultServiceReducer,
  MicrosoftMailboxReducer,
  MicrosoftDefaultServiceReducer,
  MicrosoftStorageServiceReducer,
  MicrosoftTeamServiceReducer,
  ContainerDefaultServiceReducer,
  ContainerMailboxReducer
]

const { REDUCER_NAME_TO_FN, REDUCER_FN_TO_NAME } = REDUCER_CLASSES.reduce((acc, ReducerClass) => {
  const className = ReducerClass.name
  const methodNames = Object.getOwnPropertyNames(ReducerClass)

  methodNames.forEach((methodName) => {
    const ident = `${className}.${methodName}`
    const fn = ReducerClass[methodName]
    acc['REDUCER_NAME_TO_FN'].set(ident, fn)
    acc['REDUCER_FN_TO_NAME'].set(fn, ident)
  })
  return acc
}, {REDUCER_NAME_TO_FN: new Map(), REDUCER_FN_TO_NAME: new Map()})

/**
* Gets the reducer function from the name. Only returns valid reducers
* @param nameOrReducer: the name of the reducer or reducer function
* @return the function or undefined if not found
*/
const parseReducer = function (nameOrReducer) {
  if (typeof (nameOrReducer) === 'function') {
    if (REDUCER_FN_TO_NAME.has(nameOrReducer)) {
      return nameOrReducer
    }
  } else if (typeof (nameOrReducer) === 'string') {
    const reducer = REDUCER_NAME_TO_FN.get(nameOrReducer)
    if (reducer) {
      return reducer
    }
  }

  return undefined
}

/**
* Gets the reducer name from the function. Only returns valid reducers
* @param nameOrReducer: the name of the reducer or reducer function
* @return the function name or undefined if not found
*/
const stringifyReducer = function (nameOrReducer) {
  if (typeof (nameOrReducer) === 'function') {
    const name = REDUCER_FN_TO_NAME.get(nameOrReducer)
    if (name) {
      return name
    }
  } else if (typeof (nameOrReducer) === 'string') {
    if (REDUCER_FN_TO_NAME.has(nameOrReducer)) {
      return nameOrReducer
    }
  }

  return undefined
}

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
  SlackMailboxReducer,
  SlackDefaultServiceReducer,
  TrelloMailboxReducer,
  TrelloDefaultServiceReducer,
  MicrosoftMailboxReducer,
  MicrosoftDefaultServiceReducer,
  MicrosoftStorageServiceReducer,
  MicrosoftTeamServiceReducer,
  ContainerDefaultServiceReducer,
  ContainerMailboxReducer,
  REDUCER_NAME_TO_FN,
  REDUCER_FN_TO_NAME,
  stringifyReducer,
  parseReducer
}
