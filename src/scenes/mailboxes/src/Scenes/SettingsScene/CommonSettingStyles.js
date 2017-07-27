import * as Colors from 'material-ui/styles/colors'

export default {
  /* **************************************************************************/
  // Typography
  /* **************************************************************************/

  heading: {
    marginTop: 30,
    color: Colors.grey900,
    fontWeight: 'normal',
    marginBottom: 10
  },
  headingInfo: {
    marginTop: -10,
    marginBottom: 10,
    color: Colors.grey700
  },
  subheading: {
    marginTop: 0,
    marginBottom: 10,
    color: Colors.grey900,
    fontWeight: 'normal',
    fontSize: 16
  },
  subheadingInfo: {
    fontSize: '85%',
    marginTop: -10,
    marginBottom: 10,
    color: Colors.grey500
  },

  kbd: {
    display: 'inline-block',
    margin: 1,
    padding: '1px 4px',
    fontFamily: 'Arial',
    fontSize: '11px',
    lineHeight: '1.4',
    color: '#242729',
    textShadow: '0 1px 0 #FFF',
    backgroundColor: '#e1e3e5',
    border: '1px solid #adb3b9',
    borderRadius: 3,
    boxShadow: '0 1px 0 rgba(12,13,14,0.2), 0 0 0 2px #FFF inset',
    whiteSpace: 'nowrap'
  },

  /* **************************************************************************/
  // Layout
  /* **************************************************************************/

  paper: {
    padding: 15,
    marginBottom: 5,
    marginTop: 5
  },

  /* **************************************************************************/
  // Buttons
  /* **************************************************************************/

  fileInputButton: {
    marginRight: 15,
    position: 'relative',
    overflow: 'hidden'
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    cursor: 'pointer'
  },
  button: {
    marginTop: 5,
    marginBottom: 5
  },
  buttonInline: {
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5
  },
  extraInfo: {
    fontSize: '85%',
    marginTop: 2,
    color: Colors.grey500
  }
}
