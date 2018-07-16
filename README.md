# Wavebox

![](https://img.shields.io/badge/Contributions-Welcome-ff69b4.svg)
[![Travis Build Status](https://img.shields.io/travis/wavebox/waveboxapp/master.svg)](http://travis-ci.org/wavebox/waveboxapp)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![GitHub release](https://img.shields.io/github/release/wavebox/waveboxapp.svg)](https://github.com/wavebox/waveboxapp/releases)
[![Download](https://img.shields.io/badge/downloads-wavebox.io-blue.svg)](https://wavebox.io/download/)

Your client for Gmail, Inbox, Outlook, O365, Trello, Slack & more!

Wavebox is the clever new home for cloud apps on macOS, Linux & Windows bringing  Gmail, Inbox, Outlook, O365, Trello, Slack & more into a configurable client.

Gone are the days of opening countless browser tabs and logging in and out of your favourite cloud accounts. Now you can launch Wavebox with one click, and instantly access them all in one UI, and without slowing your machine.

| [![](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_001.png)](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_001.png)  | [![](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_002.png)](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_002.png) |
|:---:|:---:|
| [![](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_003.png)](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_003.png)  | [![](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_004.png)](https://raw.githubusercontent.com/wavebox/waveboxapp/master/.github/screenshot_004.png) |

- **All your web apps in one place:** Add your favourites from our Directory of 1000+ apps/websites/services and easily hop between them to create faster workflows, and enjoy a smarter way of working.
- **Never miss a thing:** Stay signed-in to all apps simultaneously and keep up-to-date with real-time notifications and unread badges. Wavebox brings calm to your daily cloud app chaos.
- **Focus on what's important:** Declutter your desktop by having everything in one place, and use 'mute' across all apps when you need time to concentrate.
- **Better than a browser:** Unlike browser tabs which work independently, Wavebox brings everything together as a single suite of web apps. It's faster, more secure and uses less processing power.

Install Wavebox and use for free with 2 Gmail/Inbox accounts. Then upgrade to Pro to add more apps, services and features. Join thousands of individuals and teams who now spend their days in Wavebox.

Why not give it a try at [wavebox.io](https://wavebox.io)

---

**Wavebox is built using [Electron](https://github.com/atom/electron), [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/). It supports Gmail, Google Inbox, Outlook, Office 365, Slack, Trello & more.**

# Download Wavebox

Wavebox is available to download for macOS, Windows & Linux (tar & deb). Precompiled downloads are available from our downloads page [https://wavebox.io/download](https://wavebox.io/download).

If you're interested in finding out what's changed between each version you can take a look at the [changelog](https://github.com/wavebox/waveboxapp/releases)

# Building Wavebox

Here's how to build Wavebox from source.

### Prerequisites
Before you get started you'll need the following

* Python 2.7
* Nodejs 8.9.3
* npm >= 6.2.0
* Wavebox API Key
  * Download & install Wavebox for free
  * Go to Settings and then the Wavebox Pro Tab
  * In the top right if you see login, login for free otherwise continue to the next step
  * In the top right click your email address and choose Developers
  * Under the API Key section you can get your API Key

### Additional Prerequisites (windows)
* windows-build-tools available through `npm install -g windows-build-tools`

### Build Configuration
Once you've cloned the repository you will need to add your Wavebox API Key to the repository. This key will ensure that the client can talk to Google, Microsoft etc without needing to configure each one individually. Create a file in `src/shared/credentials.js` and in it place

```js
module.exports = { API_KEY: 'your_api_key' }
```

### Dependencies & Running
* To install all Wavebox npm dependencies: `npm install; npm run install:all`
* To recompile native modules: `npm run rebuild:electron`
* To run compile and run the app: `npm start`
