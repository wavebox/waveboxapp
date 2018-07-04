import RemoteStore from '../RemoteStore'
import User from '../../Models/User'
import ACContainer from '../../Models/ACContainer'
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
    * @return the extensions in a map indexed by id
    */
    this.extensionMap = () => {
      return this.extensionList().reduce((acc, info) => {
        acc.set(info.id, info)
        return acc
      }, new Map())
    }

    /**
    * @param extensionId: the id of the extension
    * @return the extension
    */
    this.getExtension = (extensionId) => {
      return this.extensionList().find((ext) => ext.id === extensionId)
    }

    /**
    * Generates a set of disabled extension ids
    * @return a set of known disabled extension ids
    */
    this.disabledExtensionIdSet = () => {
      const ids = this.extensionList()
        .filter((ext) => this.user && !this.user.hasExtensionWithLevel(ext.availableTo))
        .map((ext) => ext.id)
      return new Set(ids)
    }

    /* ****************************************/
    // Wire config
    /* ****************************************/

    /**
    * @return true if we have wire config, false otherwise
    */
    this.hasWireConfig = () => {
      return !!this.wireConfig
    }

    /**
    * @return the wire config version or 0.0.0
    */
    this.wireConfigVersion = () => {
      return (this.wireConfig || {}).version || '0.0.0'
    }

    /**
    * @return the wire config experiments dictionary
    */
    this.wireConfigExperiments = () => {
      return (this.wireConfig || {}).experiments || {}
    }

    /**
    * @param defaultVal=[]: the default value if none is found
    * @return the window open rules
    */
    this.wireConfigWindowOpenRules = (defaultVal = []) => {
      return (this.wireConfig || {}).windowOpen || defaultVal
    }

    /**
    * @param defaultVal=[]: the default value if none is found
    * @return the navigate rules
    */
    this.wireConfigNavigateRules = (defaultVal = []) => {
      return (this.wireConfig || {}).navigate || defaultVal
    }

    /* ****************************************/
    // Containers
    /* ****************************************/

    /**
    * @param containerId: the id of the container
    * @return the container or null
    */
    this.getContainer = (containerId) => {
      return this.containers.get(containerId) || null
    }

    /* ****************************************/
    // Actions
    /* ****************************************/

    const actions = this.alt.getActions(ACTIONS_NAME)
    this.bindActions({
      handleLoad: actions.LOAD,
      handleSetUser: actions.SET_USER,
      handleSetExtensions: actions.SET_EXTENSIONS,
      handleSetWireConfig: actions.SET_WIRE_CONFIG,
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
      this.user = new User({}, new Date().getTime())
    }

    // Extensions
    this.extensions = extensionStoreData[EXTENSIONS] || null

    // Wire config
    this.wireConfig = wireConfigData[WIRE_CONFIG] || null

    // Containers
    this.containers = Object.keys(containerData || {}).reduce((acc, id) => {
      acc.set(id, new ACContainer(containerData[id]))
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
      const container = new ACContainer(data)
      if (this.containers.has(id) && this.containers.get(id).version >= container.version) {
        return
      }

      updatedContainers[id] = container
      this.containers.set(id, container)
    })

    return updatedContainers
  }
}

export default CoreUserStore
