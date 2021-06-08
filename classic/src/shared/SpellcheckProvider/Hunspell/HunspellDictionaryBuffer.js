const privFactory = Symbol('privFactory')
const privAffBuffer = Symbol('privAffBuffer')
const privDicBuffer = Symbol('privDicBuffer')

class HunspellDictionaryBuffer {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param affBuffer: the aff buffer file
  * @param dicBuffer: the dic buffer file
  */
  constructor (affBuffer, dicBuffer) {
    this[privFactory] = undefined
    this[privAffBuffer] = affBuffer
    this[privDicBuffer] = dicBuffer
  }

  /**
  * Destroys the instance
  */
  destroy () {
    if (this[privFactory]) {
      this[privFactory].unmount(this[privAffBuffer])
      this[privFactory].unmount(this[privDicBuffer])
      this[privFactory] = undefined
    }

    this[privAffBuffer] = undefined
    this[privDicBuffer] = undefined
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isMounted () {
    return this[privFactory] !== undefined
  }

  get affBuffer () {
    if (!this.isMounted) { throw new Error('Buffers are not mounted. Mount into factory before use') }
    return this[privAffBuffer]
  }

  get dicBuffer () {
    if (!this.isMounted) { throw new Error('Buffers are not mounted. Mount into factory before use') }
    return this[privDicBuffer]
  }

  /* **************************************************************************/
  // Methods
  /* **************************************************************************/

  /**
  * Mounts the buffers into the factory
  * @param factory: the factory to mount into
  */
  mount (factory) {
    if (this.isMounted) {
      throw new Error('Buffers already mounted. Cannot be mounted twice')
    }
    this[privAffBuffer] = factory.mountBuffer(this[privAffBuffer])
    this[privDicBuffer] = factory.mountBuffer(this[privDicBuffer])
    this[privFactory] = factory
  }
}

export default HunspellDictionaryBuffer
