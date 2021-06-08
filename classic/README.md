Looking for the up to date Chromium version of Wavebox? [💾 Download Wavebox 10](https://wavebox.io/download).

This repository is an archive of the Electron based Wavebox Classic, which was superseded by Wavebox 10, a complete fork of Chromium that launched in 2019. You can find out more about the move to Chromium and the pace Wavebox 10 is able to keep with Chromium below...

[🚚 Wavebox moves to Chromium](https://blog.wavebox.io/wavebox-is-evolving-electron-chromium/)

[🗓️ As Chromium ramps up its release schedule, what does it mean for Wavebox?](https://blog.wavebox.io/check-chromium-release-version/)

[🚀 Wavebox release schedule and updates](https://kb.wavebox.io/how-and-when-do-i-update-wavebox/)

---

# Building Wavebox Classic
**We only recommend that you use the Chromium version of Wavebox, Wavebox 10. This contains important security fixes and features that keep you protected.** Wavebox classic was based on Electron, is no longer supported, and the level of functionality may be reduced as it no longer meets the latest web security standards.

**[💾 Download Wavebox 10](https://wavebox.io/download)**

### Prerequisites
Before you get started you'll need the following

* Python 2.7
* Nodejs 10.11.0
* npm >= 6.4.1
* windows-build-tools available through `npm install -g windows-build-tools`

### Running
* To install all Wavebox npm dependencies: `npm install; npm run install:all`
* To recompile native modules: `npm run rebuild:electron`
* To run compile and run the app: `npm start`