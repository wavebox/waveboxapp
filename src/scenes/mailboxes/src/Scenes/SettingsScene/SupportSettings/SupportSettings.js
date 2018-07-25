import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Button, Paper, Icon, Grid } from '@material-ui/core'
import electron from 'electron'
import Resolver from 'Runtime/Resolver'
import {
  SUPPORT_URL,
  BLOG_URL,
  KB_URL,
  GITHUB_ISSUE_URL,
  QUICK_START_WEB_URL,
  KB_BETA_CHANNEL_URL
} from 'shared/constants'
import { withStyles } from '@material-ui/core/styles'
import StyleMixins from 'wbui/Styles/StyleMixins'
import FARStarIcon from 'wbfa/FARStar'
import FASMagicIcon from 'wbfa/FASMagic'
import FASListAltIcon from 'wbfa/FASListAlt'
import FASTasksIcon from 'wbfa/FASTasks'

const ROW_HEIGHT = 400
const V_MARGIN = 16

const baseCellStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginTop: V_MARGIN,
  marginBottom: V_MARGIN,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 32,
  paddingBottom: 32
}
const styles = {
  // Layout
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...StyleMixins.scrolling.alwaysShowVerticalScrollbars
  },
  gridContainer: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  boxedCell: {
    ...baseCellStyle,
    height: ROW_HEIGHT
  },
  unboxedCell: {
    ...baseCellStyle,
    border: '2px solid rgb(205, 205, 205)',
    borderRadius: 2,
    height: ROW_HEIGHT
  },
  doubleHeightCellContainer: {
    marginTop: V_MARGIN,
    marginBottom: V_MARGIN,
    height: ROW_HEIGHT
  },
  doubleBoxedCell: {
    ...baseCellStyle,
    height: (ROW_HEIGHT / 2) - (V_MARGIN / 2),
    cursor: 'pointer',
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16
  },

  // Content
  imageContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: '100%',
    height: '100%',
    maxHeight: 150,
    maxWidth: 150
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  titleUnboxed: {
    fontWeight: 300,
    marginBottom: 10,
    fontSize: 18
  },
  titleBoxed: {
    fontWeight: 'normal',
    marginBottom: 10,
    fontSize: 20
  },
  titleDoubleBoxed: {
    fontWeight: 'normal',
    marginBottom: 0,
    fontSize: 18
  },
  textUnboxed: {
    fontWeight: 'normal',
    fontSize: 12
  },
  textBoxed: {
    fontWeight: 'normal',
    fontSize: 14
  },
  iconBoxed: {
    color: 'rgb(0, 153, 232)',
    fontSize: 100,
    height: 100,
    width: 120
  },
  textDoubleBoxed: {
    fontWeight: 'normal',
    fontSize: 12,
    marginTop: 5
  }
}

@withStyles(styles)
class SupportSettings extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders an unboxed cell
  * @param classes:
  * @param image: the image path
  * @param title: the title
  * @param text: the text
  * @param color: the coloring to use
  * @param buttonLabel: the label for the action text
  * @param click: the click handler
  * @return jsx
  */
  renderUnboxedCell (classes, image, title, text, color, buttonLabel, click) {
    return (
      <div className={classes.unboxedCell}>
        <div className={classes.imageContainer}>
          <div className={classes.image} style={{backgroundImage: `url("${image}")`}} />
        </div>
        <div className={classes.contentContainer}>
          <h2 className={classes.titleUnboxed} style={{color: color}}>{title}</h2>
          <p className={classes.textUnboxed}>{text}</p>
          <Button variant='raised' onClick={click}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    )
  }

  /**
  * Renders an boxed cell
  * @param classes:
  * @param IconClass: the fontawesome icon class to render
  * @param title: the title
  * @param text: the text
  * @param buttonLabel: the label for the action text
  * @param click: the click handler
  * @return jsx
  */
  renderBoxedCell (classes, IconClass, title, text, buttonLabel, click) {
    return (
      <Paper className={classes.boxedCell}>
        <div className={classes.imageContainer}>
          <IconClass className={classes.iconBoxed} />
        </div>
        <div className={classes.contentContainer}>
          <h2 className={classes.titleBoxed}>{title}</h2>
          <p className={classes.textBoxed}>{text}</p>
          <Button variant='raised' color='primary' onClick={click}>
            {buttonLabel}
          </Button>
        </div>
      </Paper>
    )
  }

  /**
  * Renders an double boxed cell
  * @param classes:
  * @param iconName: the fontawesome icon to render
  * @param iconColor: the color of the icon
  * @param title: the title
  * @param text: the text
  * @param click: the click handler
  * @return jsx
  */
  renderDoubleBoxedCell (classes, iconName, iconColor, title, text, click) {
    return (
      <Paper className={classes.doubleBoxedCell} onClick={click}>
        <div className={classes.imageContainer} style={{ height: '50%' }}>
          <Icon className={iconName} style={{ fontSize: 50, color: iconColor }} />
        </div>
        <div className={classes.contentContainer}>
          <h2 className={classes.titleDoubleBoxed}>{title}</h2>
          <p className={classes.textDoubleBoxed}>{text}</p>
        </div>
      </Paper>
    )
  }

  render () {
    const { classes } = this.props
    return (
      <div className={classes.scroller}>
        <Grid container spacing={16} className={classes.gridContainer}>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderBoxedCell(
              classes,
              FARStarIcon,
              'What\'s New?',
              'From new extensions to bug fixes, make sure you\'re up-to-date with development news.',
              'News',
              () => { window.location.hash = '/news' }
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderBoxedCell(
              classes,
              FASMagicIcon,
              'Setup Wizard',
              'Follow the step-by-step wizard to correctly configure your Wavebox.',
              'Get Started',
              () => { window.location.hash = '/app_wizard/start' }
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderBoxedCell(
              classes,
              FASListAltIcon,
              'Quick Start Guide',
              'Are you getting the most out of Wavebox? Read our getting started guide to find out.',
              'Quick Start',
              () => electron.remote.shell.openExternal(QUICK_START_WEB_URL)
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderBoxedCell(
              classes,
              FASTasksIcon,
              'Try Wavebox Beta',
              'Be the first to try out the latest features by switching to our beta channel',
              'Try Beta',
              () => electron.remote.shell.openExternal(KB_BETA_CHANNEL_URL)
            )}
          </Grid>
        </Grid>
        <Grid container spacing={16} className={classes.gridContainer}>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderUnboxedCell(
              classes,
              Resolver.image('support_kb_icon.png'),
              'Knowledge Base',
              'Find the answers to the most commonly asked questions.',
              'rgb(246, 109, 99)',
              'Knowledge Base',
              () => electron.remote.shell.openExternal(KB_URL)
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderUnboxedCell(
              classes,
              Resolver.image('support_blog_icon.png'),
              'Blog',
              'How-to articles and tutorials, plus the latest new from Wavebox HQ.',
              'rgb(82, 145, 149)',
              'Blog',
              () => electron.remote.shell.openExternal(BLOG_URL)
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderUnboxedCell(
              classes,
              Resolver.image('support_github_icon.png'),
              'GitHub',
              'Join our discussion group on GitHub.',
              'rgb(106, 109, 152)',
              'GitHub',
              () => electron.remote.shell.openExternal(GITHUB_ISSUE_URL)
            )}
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            {this.renderUnboxedCell(
              classes,
              Resolver.image('support_contact_icon.png'),
              'Email Support',
              'Send feature requests and get help from our support team by email.',
              'rgb(240, 169, 43)',
              'Support',
              () => electron.remote.shell.openExternal(SUPPORT_URL)
            )}
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default SupportSettings
