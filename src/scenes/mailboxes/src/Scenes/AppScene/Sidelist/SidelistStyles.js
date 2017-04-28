import './SidelistStyles.less'
import * as Colors from 'material-ui/styles/colors'
const FOOTER_ITEM_HEIGHT = 50

export default {
  /**
  * Layout
  */
  container: {
    backgroundColor: Colors.blueGrey900,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  footer: {
    height: 2 * FOOTER_ITEM_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  footer3Icons: {
    height: 3 * FOOTER_ITEM_HEIGHT
  },
  footer4Icons: {
    height: 4 * FOOTER_ITEM_HEIGHT
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 2 * FOOTER_ITEM_HEIGHT,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  scroller3Icons: {
    bottom: 3 * FOOTER_ITEM_HEIGHT
  },
  scroller4Icons: {
    bottom: 4 * FOOTER_ITEM_HEIGHT
  },
  itemContainer: {
    textAlign: 'center'
  },

  /**
  * Window controls
  */
  windowControls: {
    height: 25,
    width: 70,
    paddingTop: 3,
    paddingBottom: 2,
    paddingLeft: 5,
    paddingRight: 5,
    overflow: 'hidden',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  windowControlButton: {
    width: 20,
    height: 20,
    padding: 0,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    borderRadius: 2
  },
  windowControlButtonHovered: {
    backgroundColor: Colors.blueGrey700
  },
  windowControlIcon: {
    fontSize: 14
  },

  /**
  * Mailbox Item
  */
  mailboxItemContainer: {
    marginTop: 10,
    marginBottom: 10,
    position: 'relative'
  },
  mailboxItemContainerRestricted: {
    filter: 'grayscale(100%)'
  },
  mailboxAvatar: {
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  mailboxBadge: {
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: Colors.red50,
    fontWeight: process.platform === 'linux' ? 'normal' : '100',
    width: 'auto',
    minWidth: 24,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 12,
    WebkitUserSelect: 'none',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  mailboxBadgeFAIcon: {
    color: 'white',
    fontSize: 16
  },
  mailboxBadgeContainer: {
    position: 'absolute',
    top: -3,
    right: 3,
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  mailboxActiveIndicator: {
    position: 'absolute',
    left: 2,
    top: 25,
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  },
  mailboxTooltipRule: {
    height: 1,
    border: 0,
    backgroundImage: 'linear-gradient(to right, #bcbcbc, #fff, #bcbcbc)'
  },

  /**
  * Mailbox Item: Services
  */
  mailboxServiceIcons: {
    transition: 'max-height 0.5s ease-in-out',
    maxHeight: 500, // just an arbitrarily big number for the animation
    overflow: 'hidden'
  },
  mailboxServiceIconsCollapsed: {
    maxHeight: 0
  },
  mailboxServiceIconImage: {
    display: 'block',
    margin: '4px auto',
    borderWidth: 3,
    borderStyle: 'solid',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    opacity: 0.8
  },
  mailboxServiceIconImageActive: {
    display: 'block',
    margin: '4px auto',
    borderWidth: 3,
    borderStyle: 'solid',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag'
  }
}
