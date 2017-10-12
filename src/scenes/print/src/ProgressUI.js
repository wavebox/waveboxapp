import './progress.less'

class ProgressUI {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  /**
  * @param rootElement: the root element of the progress dialog
  */
  constructor (rootElement) {
    this.rootElement = rootElement
    this.elements = {
      barContainer: this.rootElement.querySelector('.bar-container'),
      bar: this.rootElement.querySelector('.bar-container>.bar'),
      percentage: this.rootElement.querySelector('.percentage'),
      status: this.rootElement.querySelector('.status')
    }
  }

  /* **************************************************************************/
  // Properties
  /* **************************************************************************/

  get isIndeterminate () { return this.elements.barContainer.classList.contains('indeterminate') }
  set isIndeterminate (v) {
    this.elements.percentage.textContent = ''
    if (v) {
      this.elements.barContainer.classList.add('indeterminate')
    } else {
      this.elements.barContainer.classList.remove('indeterminate')
    }
  }

  get percentage () {
    const v = parseFloat(this.elements.percentage.getAttribute('data-percentage'))
    return isNaN(v) ? 0 : v
  }
  set percentage (v) {
    this.elements.bar.style.width = `${v * 100}%`
    this.elements.percentage.textContent = `${Math.round(v * 100)}%`
    this.elements.percentage.setAttribute('data-percentage', v)
  }

  get status () { return this.elements.status.textContent || '' }
  set status (v) { this.elements.status.textContent = v }
}

export default ProgressUI
