import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import CommandPaletteSearchItem from './CommandPaletteSearchItem'
import { withStyles } from '@material-ui/core/styles'
import grey from '@material-ui/core/colors/grey'

const styles = {
  helper: {
    color: grey[600]
  }
}

@withStyles(styles)
class CommandPaletteSearchItemCommandSuggestion extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    item: PropTypes.shape({
      modifier: PropTypes.string.isRequired,
      keyword: PropTypes.string.isRequired,
      helper: PropTypes.string,
      description: PropTypes.string
    }).isRequired,
    onPrefillSearch: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the click event
  * @param evt: the event that fired
  */
  handleClick = (evt) => {
    const { item, onPrefillSearch, onClick } = this.props
    onPrefillSearch(evt, item)
    if (onClick) {
      onClick(evt)
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      item,
      onClick,
      onPrefillSearch,
      onRequestClose,
      ...passProps
    } = this.props

    return (
      <CommandPaletteSearchItem
        primaryText={(
          <React.Fragment>
            {`${item.modifier}${item.keyword}`}
            {item.helper ? (
              <span className={classes.helper}> {item.helper}</span>
            ) : undefined}
          </React.Fragment>
        )}
        secondaryText={item.description}
        onClick={this.handleClick}
        {...passProps} />
    )
  }
}

export default CommandPaletteSearchItemCommandSuggestion
