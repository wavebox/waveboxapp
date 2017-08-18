class WaveboxHTTP {
  /* **************************************************************************/
  // News
  /* **************************************************************************/

  /**
  * Fetches the news heading from the server
  * @return promise
  */
  static fetchLatestNewsHeading () {
    return Promise.resolve()
      .then(() => window.fetch('https://wavebox.io/news/feed/'))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }
}

export default WaveboxHTTP
