import xmldom from 'xmldom'
import { URL } from 'url'
import semver from 'semver'
import uuid from 'uuid'
import querystring from 'querystring'

export default Object.freeze({
  querystring: querystring,
  semver: semver,
  URL: URL,
  uuid: uuid,
  xmldom: xmldom
})
