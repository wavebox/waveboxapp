const popover = {
  background: 'rgba(34, 34, 34, 0.9)',
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: '13px',
  color: 'white',
  maxWidth: 200,
  textAlign: 'center'
}
const arrow = {
  color: 'rgba(34, 34, 34, 0.9)',
  borderColor: false
}
const basicPopoverStyles = {
  style: popover,
  arrowStyle: arrow
}
const basicPopoverStyles400w = {
  style: {...popover, maxWidth: 400},
  arrowStyle: arrow
}

export default {
  basicPopoverStyles,
  basicPopoverStyles400w
}
export {
  basicPopoverStyles,
  basicPopoverStyles400w
}
