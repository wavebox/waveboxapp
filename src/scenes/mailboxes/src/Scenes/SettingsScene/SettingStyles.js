import * as Colors from 'material-ui/styles/colors'

export default {
  /* **************************************************************************/
  // Modal
  /* **************************************************************************/

  dialog: {
    width: '90%',
    maxWidth: 1200
  },
  tabToggles: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'stretch'
  },
  tabToggle: {
    height: 50,
    borderRadius: 0,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid'
  },

  /* **************************************************************************/
  // General
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
  paper: {
    padding: 15,
    marginBottom: 5,
    marginTop: 5
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

  /* **************************************************************************/
  // Account
  /* **************************************************************************/

  accountPicker: {
    position: 'relative',
    height: 100,
    marginTop: -24
  },
  accountPickerAvatar: {
    position: 'absolute',
    top: 20,
    left: 20
  },
  accountPickerContainer: {
    position: 'absolute',
    top: 25,
    left: 100,
    right: 15
  },

  /* **************************************************************************/
  // Account Services
  /* **************************************************************************/

  servicePaper: {
    padding: 0,
    marginBottom: 16,
    marginTop: 16
  },
  serviceBody: {
    padding: 15
  },

  /* **************************************************************************/
  // Misc
  /* **************************************************************************/

  userscriptLink: {
    color: Colors.blue700,
    fontSize: '85%',
    marginBottom: 10
  },

  mockUnreadActivityIndicator: {
    backgroundColor: Colors.red400,
    color: 'white',
    display: 'inline-block',
    borderRadius: '50%',
    width: 15,
    height: 15,
    lineHeight: '14px',
    verticalAlign: 'middle',
    textAlign: 'center',
    fontSize: '10px',
    paddingRight: 1
  }
}
