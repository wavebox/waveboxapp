import pkg from 'package.json'

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
      .then(() => window.fetch(`https://waveboxio.com/news/feed/?channel=${pkg.releaseChannel}`))
      .then((res) => res.ok ? Promise.resolve(res) : Promise.reject(res))
      .then((res) => res.json())
  }
}

export default WaveboxHTTP
