const scrolling = { }
scrolling.alwaysShowScrollbars = {
  '&::-webkit-scrollbar': {
    WebkitAppearance: 'none',
    width: 7,
    height: 7
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,.5)',
    boxShadow: '0 0 1px rgba(255,255,255,.5)'
  }
}
scrolling.alwaysShowVerticalScrollbars = {
  ...scrolling.alwaysShowScrollbars,
  overflowX: 'hidden',
  overflowY: 'auto'
}

const mixins = {
  scrolling: scrolling
}

export default mixins
