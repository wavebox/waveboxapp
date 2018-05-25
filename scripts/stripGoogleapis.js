const path = require('path')
const fs = require('fs-extra')
const { SRC_DIR } = require('./constants')
const Colors = require('colors/safe')

const MODULE_DIR = path.join(SRC_DIR, 'scenes/mailboxes/node_modules/googleapis/')
const APIS_DIR = path.join(MODULE_DIR, 'build/src/apis')
const INDEX_PATH = path.join(MODULE_DIR, 'build/src/index.js')
const APIS_INDEX_PATH = path.join(APIS_DIR, 'index.js')
const REQUIRED_APIS = new Set([
  'plus',
  'gmail',
  'oauth2'
])

console.log(`${Colors.inverse('Strip googleapis:')} ${APIS_DIR}`)
let count = 0
fs.readdirSync(APIS_DIR).forEach((item) => {
  if (!REQUIRED_APIS.has(item)) {
    count++
    fs.removeSync(path.join(APIS_DIR, item))
  }
})
fs.writeFileSync(INDEX_PATH, `
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });

  const googleapis_1 = require("./googleapis");
  exports.GoogleApis = googleapis_1.GoogleApis;
  const google = new googleapis_1.GoogleApis();
  exports.google = google;
`)
fs.writeFileSync(APIS_INDEX_PATH, `
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  result["default"] = mod;
  return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const gmail = __importStar(require("./gmail"));
const oauth2 = __importStar(require("./oauth2"));
const plus = __importStar(require("./plus"));
exports.APIS = {
  gmail: gmail.VERSIONS,
  oauth2: oauth2.VERSIONS,
  plus: plus.VERSIONS
};
class GeneratedAPIs {
  constructor() {
      this.gmail = gmail.gmail.bind(this);
      this.oauth2 = oauth2.oauth2.bind(this);
      this.plus = plus.plus.bind(this);
  }
}
exports.GeneratedAPIs = GeneratedAPIs;
`)
console.log(Colors.bgGreen.white(`Stripped ${count} items`))
