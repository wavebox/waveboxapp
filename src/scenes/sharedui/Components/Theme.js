import { Spacing, zIndex } from 'material-ui/styles'
import * as Colors from 'material-ui/styles/colors'
import * as ColorManipulator from 'material-ui/utils/colorManipulator'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

export default getMuiTheme({
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: Colors.lightBlue600,
    primary2Color: Colors.lightBlue500,
    primary3Color: Colors.blueGrey100,
    accent1Color: Colors.redA200,
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey600,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500
  }
})
