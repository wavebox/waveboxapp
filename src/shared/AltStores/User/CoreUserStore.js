import RemoteStore from '../RemoteStore'
import User from '../../Models/User'
import {Container} from '../../Models/Container'
import {
  ACTIONS_NAME,
  DISPATCH_NAME,
  STORE_NAME
} from './AltUserIdentifiers'
import {
  CLIENT_ID,
  ANALYTICS_ID,
  CREATED_TIME,
  CLIENT_TOKEN,
  USER,
  USER_EPOCH,
  EXTENSIONS,
  WIRE_CONFIG
} from 'shared/Models/DeviceKeys'

class CoreUserStore extends RemoteStore {
  /* **************************************************************************/
  // Lifecyle
  /* **************************************************************************/

  constructor () {
    super(DISPATCH_NAME, ACTIONS_NAME, STORE_NAME)

    this.clientId = null
    this.analyticsId = null
    this.createdTime = null

    this.clientToken = null
    this.user = null

    this.extensions = null
    this.wireConfig = null
    this.containers = new Map()

    /* ****************************************/
    // Extensions
    /* ****************************************/

    /**
    * @return all the extensions
    */
    this.extensionList = () => { return this.extensions || [] }

    /**
    * @return all the extensions supported in this version, indexed by id
    */
    this.supportedExtensionsIndex = () => {
      return this.supportedExtensionList().reduce((acc, ext) => {
        acc[ext.id] = ext
        return acc
      }, {})
    }

    /**
    * @param extensionId: the id of the extension
    * @return the extension
    */
    this.getExtension = (extensionId) => {
      return this.extensionList().find((ext) => ext.id === extensionId)
    }

    /* ****************************************/
    // Wire config
    /* ****************************************/

    /**
    * @return true if we have wire config, false otherwise
    */
    this.hasWireConfig = () => { return !!this.wireConfig }

    /**
    * @return the wire config version or 0.0.0
    */
    this.wireConfigVersion = () => { return (this.wireConfig || {}).version || '0.0.0' }

    /**
    * @return the wire config experiments dictionary
    */
    this.wireConfigExperiments = () => { return (this.wireConfig || {}).experiments || {} }

    /* ****************************************/
    // Containers
    /* ****************************************/

    /**
    * @param containerId: the id of the container
    * @return the container or null
    */
    this.getContainer = (containerId) => { return this.containers.get(containerId) || null }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleSetUser: actions.SET_USER,
      handleSetExtensions: actions.SET_EXTENSIONS,
      handleSetWriteConfig: actions.SET_WIRE_CONFIG,
      handleAddContainers: actions.ADD_CONTAINERS
    })
  }

  /* **************************************************************************/
  // Loading
  /* **************************************************************************/

  handleLoad ({ userData, containerData, extensionStoreData, wireConfigData }) {
    // Install instance
    this.clientId = userData[CLIENT_ID]
    this.analyticsId = userData[ANALYTICS_ID]
    this.createdTime = userData[CREATED_TIME]

    // User
    this.clientToken = userData[CLIENT_TOKEN]
    if (userData[USER] && userData[USER_EPOCH]) {
      this.user = new User(userData[USER], userData[USER_EPOCH])
    } else {
      this.user = null
    }

    // Extensions
    this.extensions = extensionStoreData[EXTENSIONS] || null

    // Wire config
    this.wireConfig = wireConfigData[WIRE_CONFIG] || null

    // Containers
    this.containers = Object.keys(containerData || {}).reduce((acc, id) => {
      acc.set(id, new Container(id, containerData[id]))
      return acc
    }, new Map())
  }

  /* **************************************************************************/
  // User
  /* **************************************************************************/

  handleSetUser ({ userJS, userEpoch }) {
    this.user = new User(userJS, userEpoch)
  }

  /* **************************************************************************/
  // Extensions
  /* **************************************************************************/

  handleSetExtensions ({ extensions }) {
    this.extensions = extensions
  }

  handleSetWireConfig ({ config }) {
    this.wireConfig = config
  }

  /* **************************************************************************/
  // Containers
  /* **************************************************************************/

  handleAddContainers ({ containers }) {
    const updatedContainers = {}
    Object.keys(containers).forEach((id) => {
      const data = containers[id]
      if (data === undefined || data === null) {
        return
      }
      const container = new Container(id, data)
      if (this.containers.has(id) && this.containers.get(id).version >= container.version) {
        return
      }

      updatedContainers[id] = container
      this.container.set(id, container)
    })

    return updatedContainers
  }
}

export default CoreUserStore
