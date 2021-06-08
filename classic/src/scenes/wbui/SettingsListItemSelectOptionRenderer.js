import React from 'react'
import { Divider, MenuItem } from '@material-ui/core'

class SettingsListItemSelectOptionRenderer {
  /**
  * Renders a value
  * @param options: the list of options
  * @param value: the value to render
  * @return the value to render
  */
  static renderValue (options, value) {
    return (options.find((opt) => opt.value === value) || {}).label
  }

  /**
  * Renders the options for the user to pick from
  * @param options: the list of options
  * @return an array of jsx elements
  */
  static renderOptions (options) {
    return options.map((opt, i) => {
      if (opt.divider) {
        return (<Divider key={`divider-${i}`} {...opt.DividerProps} />)
      } else {
        return (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled} {...opt.MenuItemProps}>
            {opt.primaryText ? opt.primaryText : opt.label}
          </MenuItem>
        )
      }
    })
  }
}

export default SettingsListItemSelectOptionRenderer
