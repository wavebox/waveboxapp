class CRExtensionI18n {
  /**
  * Replaces the numbers substitutions in a message
  * @param message: the message to replace the substitutions in
  * @param substitutions: the substitutions to replace
  * @return the updated string
  */
  static _replaceNumberedSubstitutions (message, substitutions) {
    return message.replace(/\$(\d+)/, (_, number) => {
      const index = parseInt(number, 10) - 1
      return substitutions[index] || ''
    })
  }

  /**
  * Replaces the placeholders in a message string
  * @param message: the message to replace the placeholders in
  * @param placeholders: the placeholders to replace
  * @param substitutions: the substitutions to put in place
  * @return the updated string
  */
  static _replacePlaceholders (message, placeholders, substitutions) {
    if (typeof substitutions === 'string') { substitutions = [substitutions] }
    if (!Array.isArray(substitutions)) { substitutions = [] }

    if (placeholders) {
      Object.keys(placeholders).forEach((name) => {
        let {content} = placeholders[name]
        content = this._replaceNumberedSubstitutions(content, substitutions)
        message = message.replace(new RegExp(`\\$${name}\\$`, 'gi'), content)
      })
    }

    return this._replaceNumberedSubstitutions(message, substitutions)
  }

  /**
  * Translates a value
  * @param messages: the messages to use
  * @param messageName: the name of the message to translate
  * @param substitutions=[]: the substitutions to put in place
  * @return the translated message or undefined
  */
  static translate (messages, messageName, substitutions = []) {
    if (messages[messageName]) {
      const { message, placeholders } = messages[messageName]
      return this._replacePlaceholders(message, placeholders, substitutions)
    } else {
      return undefined
    }
  }

  /**
  * @param fieldValue: the value in the field
  * @return true if the manifest field is translatable
  */
  static isManifestFieldTranslatable (fieldValue) {
    return fieldValue && fieldValue.startsWith('__MSG_') && fieldValue.endsWith('__')
  }

  /**
  * Translates a manifest field if the field is set to be translated
  * @param messages: the messages to use
  * @param fieldValue: the value of the field
  * @return the translated message or undefined
  */
  static translateManifestField (messages, fieldValue) {
    if (this.isManifestFieldTranslatable(fieldValue)) {
      const messageName = fieldValue.replace(/^__MSG_/, '').replace(/__$/, '')
      return this.translate(messages, messageName)
    } else {
      return fieldValue
    }
  }

  /**
  * Translates a plain javascript object. Does updates in situe so to be sure to pass a copy if required
  * @param messages: the messages to replace with
  * @param obj: the object to update
  * @return the object that was updated
  */
  static _translateObject (messages, obj) {
    const keyset = Array.isArray(obj) ? obj.map((v, i) => i) : Object.keys(obj)
    keyset.forEach((k) => {
      if (typeof (obj[k]) === 'string') {
        obj[k] = this.translateManifestField(messages, obj[k])
      } else if (typeof (obj[k]) === 'object') {
        obj[k] = this._translateObject(messages, obj[k])
      }
    })
    return obj
  }

  /**
  * Translates the manifest data, returning a new copy of it
  * @param messages: the messages to replace with
  * @param manifestData: the data to translate
  * @return a new copy of the manifest
  */
  static translatedManifest (messages, manifestData) {
    let translated = JSON.parse(JSON.stringify(manifestData))
    translated = this._translateObject(messages, translated)
    translated['wavebox_extension_id'] = manifestData['wavebox_extension_id']
    return translated
  }
}

module.exports = CRExtensionI18n
