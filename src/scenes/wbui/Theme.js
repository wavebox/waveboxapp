import { createMuiTheme } from 'material-ui/styles'
import lightBlue from 'material-ui/colors/lightBlue'
import red from 'material-ui/colors/red'

export default createMuiTheme({
  palette: {
    primary: lightBlue,
    secondary: red,
    error: red,
    background: {
      default: '#fff'
    }
  },
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    button: {
      textTransform: 'none'
    }
  }
})
