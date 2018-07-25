import pdfjs from 'pdfjs-dist'
window.PDFJS = pdfjs
window.PDFJS.GlobalWorkerOptions.workerSrc = 'worker.bundle.js'
export default pdfjs
