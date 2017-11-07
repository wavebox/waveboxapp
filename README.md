# Wavebox

![Screenshot](https://wavebox.io/images/intro_gallery_preview.png "Screenshot")

**Wavebox is an open-source web communication tool built for the modern web. It's built using [Electron](https://github.com/atom/electron), [React](https://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/). It supports Gmail, Google Inbox, Outlook, Office 365, Slack, Trello & more.**

Find out more about Wavebox at [wavebox.io](https://wavebox.io)

---

![](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)
[![Travis Build Status](https://img.shields.io/travis/wavebox/waveboxapp.svg)](http://travis-ci.org/wavebox/waveboxapp)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Download](https://img.shields.io/badge/downloads-wavebox.io-brightgreen.svg)](https://wavebox.io/download/)


# Download Wavebox

Wavebox is available to download for macOS, Windows & Linux (tar & deb). Precompiled downloads are available from our downloads page [https://wavebox.io/download](https://wavebox.io/download).

If you're interested in finding out what's changed between each version you can take a look at the [changelog](https://github.com/wavebox/waveboxapp/releases)

# Building Wavebox

Here's how to build Wavebox from source.

### Prerequisites
Before you get started you'll need the following

* Nodejs version 7.9.0 [download](https://nodejs.org/en/)
* Wavebox API Key
  * Download & install Wavebox for free
  * Go to Settings and then the Wavebox Pro Tab
  * In the top right if you see login, login for free otherwise continue to the next step
  * In the top right click your email address and choose Developers
  * Under the API Key section you can get your API Key

### Build Configuration
Once you've cloned the repository you will need to add your Wavebox API Key to the repository. This key will ensure that the client can talk to Google, Microsoft etc without needing to configure each one individually. Create a file in `src/shared/credentials.js` and in it place

```js
module.exports = { API_KEY: 'your_api_key' }
```

### Dependencies & Running
* To install all Wavebox npm dependencies: `npm install; npm run install:all`
* To recompile native modules: `npm run rebuild:electron`
* To run compile and run the app: `npm start`
