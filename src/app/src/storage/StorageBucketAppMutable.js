import StorageBucket from './StorageBucket'

class StorageBucketAppMutable extends StorageBucket {
  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setItem (k, v) { return this._setItem(k, v) }

  /**
  * @param items: the items to set
  */
  setItems (items) { return this._setItems(items) }

  /**
  * @param k: the key to set
  * @param v: the value to set
  * @return v
  */
  setJSONItem (k, v) { return this._setItem(k, JSON.stringify(v)) }

  /**
  * @param items: a map of key value pairs to set
  */
  setJSONItems (items) {
    const jsonItems = Object.keys(items).reduce((acc, k) => {
      acc[k] = JSON.stringify(items[k])
      return acc
    }, {})
    return this.setItems(jsonItems)
  }

  /**
  * @param k: the key to remove
  */
  removeItem (k) { return this._removeItem(k) }
}

export default StorageBucketAppMutable
