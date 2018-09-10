import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

// https://github.com/mui-org/material-ui/blob/v1-beta/docs/src/pages/customization/css-in-js/RenderProps.js
function createStyled (styles, options) {
  function Styled (props) {
    const { children, ...other } = props
    return props.children(other)
  }
  Styled.propTypes = {
    children: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired
  }
  return withStyles(styles, options)(Styled)
}

export default createStyled
