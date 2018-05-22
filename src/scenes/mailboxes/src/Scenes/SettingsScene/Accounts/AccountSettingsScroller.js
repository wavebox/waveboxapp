import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import ReactDOM from 'react-dom'
import shallowCompare from 'react-addons-shallow-compare'
import Scrollspy from 'react-scrollspy'
import StyleMixins from 'wbui/Styles/StyleMixins'
import uuid from 'uuid'
import { List, ListItem, Paper } from '@material-ui/core'
import lightBlue from '@material-ui/core/colors/lightBlue'

const CONTENT_WIDTH = 600
const SCROLLSPY_WIDTH = 210

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    overflow: 'hidden'
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: SCROLLSPY_WIDTH,
    bottom: 0,
    right: 0,
    paddingBottom: 100,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  scrollspy: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCROLLSPY_WIDTH,
    maxHeight: '100%',
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  scrollspyList: {
    paddingTop: 0,
    paddingBottom: 0
  },
  scrollspyItem: {
    fontSize: 14,

    '&.is-current': {
      backgroundColor: lightBlue[600],
      color: 'white'
    }
  },
  scrollspyIcon: {
    marginRight: 6
  },
  scrollspyIconWrap: {
    marginRight: 6
  },
  [`@media (max-width: ${CONTENT_WIDTH + (SCROLLSPY_WIDTH)}px)`]: {
    scroller: {
      left: 0
    },
    scrollspy: {
      display: 'none'
    }
  }
}

@withStyles(styles)
class AccountSettingsScroller extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    scrollspyItems: PropTypes.array.isRequired
  }

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)
    this.instanceId = uuid.v4()
    this.scrollerRef = null
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Scrolls to a section
  */
  scrollToSection = (evt, sectionName) => {
    const scroller = ReactDOM.findDOMNode(this.scrollerRef)
    const target = scroller.querySelector(`#${sectionName}`)
    scroller.scrollTop = target.offsetTop
  }

  /* **************************************************************************/
  // Render
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      children,
      classes,
      className,
      scrollspyItems,
      ...passProps
    } = this.props

    return (
      <div
        className={classNames(className, classes.root)}
        id={`RC-AccountSettingsScroller--${this.instanceId}`}
        {...passProps}>
        <div
          className={classes.scroller}
          ref={(n) => { this.scrollerRef = n }}>
          {children}
        </div>
        <Paper className={classes.scrollspy}>
          <List dense className={classes.scrollspyList}>
            <Scrollspy
              rootEl={`#RC-AccountSettingsScroller--${this.instanceId} .${classes.scroller}`}
              componentTag='div'
              items={scrollspyItems.map((item) => item.id)}
              currentClassName='is-current'>
              {scrollspyItems.map((item, i, arr) => {
                return (
                  <ListItem
                    key={item.id}
                    divider={i !== (arr.length - 1)}
                    button
                    dense
                    className={classes.scrollspyItem}
                    onClick={(evt) => this.scrollToSection(evt, item.id)}>
                    {item.IconClass ? (
                      <item.IconClass className={classes.scrollspyIcon} />
                    ) : undefined}
                    {item.icon ? (
                      <span className={classes.scrollspyIconWrap}>{item.icon}</span>
                    ) : undefined}
                    {item.name}
                  </ListItem>
                )
              })}
            </Scrollspy>
          </List>
        </Paper>
      </div>
    )
  }
}

export default AccountSettingsScroller
