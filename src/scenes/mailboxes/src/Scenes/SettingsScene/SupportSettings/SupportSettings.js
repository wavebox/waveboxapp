import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { RaisedButton, Paper } from 'material-ui'
import { SUPPORT_URL, BLOG_URL, KB_URL, GITHUB_ISSUE_URL } from 'shared/constants'
import electron from 'electron'

const styles = {
  // Layout
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto'
  },
  container: {
    width: '100%',
    height: '100%',
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'stretch'
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    paddingTop: 8,
    paddingBottom: 8
  },
  firstRow: {
    paddingTop: 16
  },
  lastRow: {
    paddingBottom: 16
  },
  cell: {
    width: '100%',
    height: '100%',
    marginLeft: 8,
    marginRight: 8,
    padding: 16,
    display: 'flex',
    flexDirection: 'column'
  },
  firstCell: {
    marginLeft: 16
  },
  lastCell: {
    marginRight: 16
  },

  // Content
  heading: {
    fontWeight: 300,
    marginBottom: 10
  },
  subHeading: {
    fontWeight: 300,
    fontSize: 14
  },
  image: {
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    width: '100%',
    height: '100%'
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    textAlign: 'center'
  }
}

export default class SupportSettings extends React.Component {
  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    return (
      <div style={styles.scroller} className='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'>
        <div style={styles.container}>
          <div style={{...styles.row, ...styles.firstRow}}>
            <Paper style={{...styles.cell, ...styles.firstCell}}>
              <div style={{...styles.image, backgroundImage: `url("../../images/support_blog_icon.png")`}} />
              <div style={styles.contentContainer}>
                <h2 style={styles.heading}>Blog Tutorials</h2>
                <p style={styles.subHeading}>Discover what's new and how-to guides on the Wavebox blog</p>
                <RaisedButton
                  onClick={() => electron.remote.shell.openExternal(BLOG_URL)}
                  primary
                  label='Blog' />
              </div>
            </Paper>
            <Paper style={{...styles.cell, ...styles.lastCell}}>
              <div style={{...styles.image, backgroundImage: `url("../../images/support_contact_icon.png")`}} />
              <div style={styles.contentContainer}>
                <h2 style={styles.heading}>Contact Support</h2>
                <p style={styles.subHeading}>Send feature requests or get help with an issue you're facing</p>
                <RaisedButton
                  onClick={() => electron.remote.shell.openExternal(SUPPORT_URL)}
                  primary
                  label='Contact' />
              </div>
            </Paper>
          </div>
          <div style={{...styles.row, ...styles.lastRow}}>
            <Paper style={{...styles.cell, ...styles.firstCell}}>
              <div style={{...styles.image, backgroundImage: `url("../../images/support_kb_icon.png")`}} />
              <div style={styles.contentContainer}>
                <h2 style={styles.heading}>Knowledge Base</h2>
                <p style={styles.subHeading}>Find the answers to the most commonly asked questions</p>
                <RaisedButton
                  onClick={() => electron.remote.shell.openExternal(KB_URL)}
                  primary
                  label='KB' />
              </div>
            </Paper>
            <Paper style={{...styles.cell, ...styles.lastCell}}>
              <div style={{...styles.image, backgroundImage: `url("../../images/support_github_icon.png")`}} />
              <div style={styles.contentContainer}>
                <h2 style={styles.heading}>GitHub</h2>
                <p style={styles.subHeading}>Join the discussion on our GitHub page</p>
                <RaisedButton
                  onClick={() => electron.remote.shell.openExternal(GITHUB_ISSUE_URL)}
                  primary
                  label='GitHub' />
              </div>
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}
