import pkg from 'package.json'
import path from 'path'
import AppDirectory from 'appdirectory'
import RuntimePaths from 'shared/Runtime/RuntimePaths'
export default RuntimePaths(pkg, path, AppDirectory)
