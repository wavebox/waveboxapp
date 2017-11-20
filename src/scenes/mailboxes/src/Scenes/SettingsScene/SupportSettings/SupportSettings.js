import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, Paper, FontIcon } from 'material-ui'
import { Container, Row, Col } from 'Components/Grid'
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
    overflow: 'auto'
  },
  container: {
    minWidth: 600
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
  textDoubleBoxed: {
    fontWeight: 'normal',
    fontSize: 12,
    marginTop: 5
  }
}

export default class SupportSettings extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  /**
  * Renders an unboxed cell
  * @param image: the image path
  * @param title: the title
  * @param text: the text
  * @param color: the coloring to use
  * @param buttonLabel: the label for the action text
  * @param click: the click handler
  * @return jsx
  */
  renderUnboxedCell (image, title, text, color, buttonLabel, click) {
    return (
      <div style={styles.unboxedCell}>
        <div style={styles.imageContainer}>
          <div style={{...styles.image, backgroundImage: `url("${image}")`}} />
        </div>
        <div style={styles.contentContainer}>
          <h2 style={{...styles.titleUnboxed, color: color}}>{title}</h2>
          <p style={styles.textUnboxed}>{text}</p>
          <RaisedButton onClick={click} label={buttonLabel} />
        </div>
      </div>
    )
  }

  /**
  * Renders an boxed cell
  * @param iconName: the fontawesome icon to render
  * @param title: the title
  * @param text: the text
  * @param buttonLabel: the label for the action text
  * @param click: the click handler
  * @return jsx
  */
  renderBoxedCell (iconName, title, text, buttonLabel, click) {
    return (
      <Paper style={styles.boxedCell}>
        <div style={styles.imageContainer}>
          <FontIcon
            className={`fa fa-fw ${iconName}`}
            color='rgb(0, 153, 232)'
            style={{ fontSize: 100 }} />
        </div>
        <div style={styles.contentContainer}>
          <h2 style={styles.titleBoxed}>{title}</h2>
          <p style={styles.textBoxed}>{text}</p>
          <RaisedButton onClick={click} primary label={buttonLabel} />
        </div>
      </Paper>
    )
  }

  /**
  * Renders an double boxed cell
  * @param iconName: the fontawesome icon to render
  * @param iconColor: the color of the icon
  * @param title: the title
  * @param text: the text
  * @param click: the click handler
  * @return jsx
  */
  renderDoubleBoxedCell (iconName, iconColor, title, text, click) {
    return (
      <Paper style={styles.doubleBoxedCell} onClick={click}>
        <div style={{...styles.imageContainer, height: '50%'}}>
          <FontIcon
            className={`fa fa-fw ${iconName}`}
            color={iconColor}
            style={{ fontSize: 50 }} />
        </div>
        <div style={styles.contentContainer}>
          <h2 style={styles.titleDoubleBoxed}>{title}</h2>
          <p style={styles.textDoubleBoxed}>{text}</p>
        </div>
      </Paper>
    )
  }

  render () {
    return (
      <div style={styles.scroller} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
        <Container fluid style={styles.container}>
          <Row>
            <Col xs={6}>
              <Row>
                <Col md={6}>
                  {this.renderBoxedCell(
                    'fa-tachometer',
                    'Optimize Wavebox',
                    'Check to see how your Wavebox is performing and sleep accounts to save resources.',
                    'Optimize Wavebox',
                    () => { window.location.hash = '/optimize_wizard/start' }
                  )}
                </Col>
                <Col md={6}>
                  {this.renderBoxedCell(
                    'fa-magic',
                    'Setup Wizard',
                    'Follow the step-by-step wizard to correctly configure your Wavebox.',
                    'Get Started',
                    () => { window.location.hash = '/app_wizard/start' }
                  )}
                </Col>
              </Row>
            </Col>
            <Col xs={6}>
              <Row>
                <Col md={6}>
                  {this.renderBoxedCell(
                    'fa-list-alt',
                    'Quick Start Guide',
                    'Are you getting the most out of Wavebox? Read our getting started guide to find out.',
                    'Quick Start',
                    () => electron.remote.shell.openExternal(QUICK_START_WEB_URL)
                  )}
                </Col>
                <Col md={6}>
                  <div style={styles.doubleHeightCellContainer}>
                    {this.renderDoubleBoxedCell(
                      'fa-star-o',
                      'rgb(249, 103, 97)',
                      'What\'s New?',
                      'From new extensions to bug fixes, make sure you\'re up-to-date with development news.',
                      () => { window.location.hash = '/news' }
                    )}
                    {this.renderDoubleBoxedCell(
                      'fa-tasks',
                      'rgb(101, 187, 188)',
                      'Try Wavebox Beta',
                      'Be the first to try out the latest features by switching to our beta channel.',
                      () => electron.remote.shell.openExternal(KB_BETA_CHANNEL_URL)
                    )}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <Row>
                <Col md={6}>
                  {this.renderUnboxedCell(
                    Resolver.image('support_kb_icon.png'),
                    'Knowledge Base',
                    'Find the answers to the most commonly asked questions.',
                    'rgb(246, 109, 99)',
                    'Knowledge Base',
                    () => electron.remote.shell.openExternal(KB_URL)
                  )}
                </Col>
                <Col md={6}>
                  {this.renderUnboxedCell(
                    Resolver.image('support_blog_icon.png'),
                    'Blog',
                    'How-to articles and tutorials, plus the latest new from Wavebox HQ.',
                    'rgb(82, 145, 149)',
                    'Blog',
                    () => electron.remote.shell.openExternal(BLOG_URL)
                  )}
                </Col>
              </Row>
            </Col>
            <Col xs={6}>
              <Row>
                <Col md={6}>
                  {this.renderUnboxedCell(
                    Resolver.image('support_github_icon.png'),
                    'GitHub',
                    'Join our discussion group on GitHub.',
                    'rgb(106, 109, 152)',
                    'GitHub',
                    () => electron.remote.shell.openExternal(GITHUB_ISSUE_URL)
                  )}
                </Col>
                <Col md={6}>
                  {this.renderUnboxedCell(
                    Resolver.image('support_contact_icon.png'),
                    'Email Support',
                    'Send feature requests and get help from our support team by email.',
                    'rgb(240, 169, 43)',
                    'Support',
                    () => electron.remote.shell.openExternal(SUPPORT_URL)
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
