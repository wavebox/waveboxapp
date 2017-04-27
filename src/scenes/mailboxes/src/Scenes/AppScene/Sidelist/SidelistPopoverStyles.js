const popover = {
  background: 'rgba(34, 34, 34, 0.9)',
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
  fontSize: '13px',
  color: 'white'
}
const arrow = {
  color: 'rgba(34, 34, 34, 0.9)',
  borderColor: false
}

const basicPopoverStyles = {
  style: popover,
  arrowStyle: arrow
}
const mailboxPopoverStyles = {
  style: Object.assign({}, popover, { transform: 'translateX(10px)' }),
  arrowStyle: arrow
}

export { basicPopoverStyles, mailboxPopoverStyles }
