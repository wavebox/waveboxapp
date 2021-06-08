import React from 'react'
import PropTypes from 'prop-types'
import shallowCompare from 'react-addons-shallow-compare'
import { MenuItem, FormControl, Select, InputLabel } from '@material-ui/core'
import ACMailbox from 'shared/Models/ACAccounts/ACMailbox'

const ACTION_TYPES = Object.freeze({
  ASK: 'ASK',
  ACCOUNT: 'ACCOUNT',
  DOMAIN: 'DOMAIN'
})

class ULinkORRememberInput extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    targetUrl: PropTypes.string.isRequired,
    isCommandTrigger: PropTypes.bool.isRequired
  }

  static get ACTION_TYPES () { return ACTION_TYPES }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentWillReceiveProps (nextProps) {
    if (this.props.targetUrl !== nextProps.targetUrl) {
      this.setState({
        proposedMatches: ACMailbox.generateAvailableWindowOpenRulesForUrl(nextProps.targetUrl),
        value: ACTION_TYPES.ASK
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    proposedMatches: ACMailbox.generateAvailableWindowOpenRulesForUrl(this.props.targetUrl),
    value: ACTION_TYPES.ASK
  }

  /* **************************************************************************/
  // Public
  /* **************************************************************************/

  /**
  * Gets the type of the value from the input
  * @return the type
  */
  getType = () => {
    const { value } = this.state
    return value.startsWith(ACTION_TYPES.DOMAIN)
      ? ACTION_TYPES.DOMAIN
      : value
  }

  /**
  * Gets the match from the input
  * @return the match or undefined
  */
  getMatch = () => {
    const { value, proposedMatches } = this.state
    return value.startsWith(ACTION_TYPES.DOMAIN)
      ? proposedMatches[parseInt(value.substr(ACTION_TYPES.DOMAIN.length))]
      : undefined
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  /**
  * Handles the input changing
  */
  handleChange = (evt) => {
    this.setState({ value: evt.target.value }, () => {
      if (this.props.onChange) {
        this.props.onChange(evt, this.getType(), this.getMatch())
      }
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { targetUrl, isCommandTrigger, ...passProps } = this.props
    const { proposedMatches, value } = this.state

    return (
      <FormControl fullWidth {...passProps}>
        <InputLabel>
          {isCommandTrigger ? (
            'Do you want to save this behaviour?'
          ) : (
            'What do you want to do next time?'
          )}
        </InputLabel>
        <Select
          value={value}
          onChange={this.handleChange}
          MenuProps={{ MenuListProps: { dense: true } }}>
          <MenuItem value={ACTION_TYPES.ASK}>
            {isCommandTrigger ? `Don't save` : 'Ask me again'}
          </MenuItem>
          {proposedMatches.map((match, index) => (
            <MenuItem
              key={`${ACTION_TYPES.DOMAIN}${index}`}
              value={`${ACTION_TYPES.DOMAIN}${index}`}>
              {`Remember this for all "${match.queryHostname || match.hostname}" links in this account`}
            </MenuItem>
          ))}
          <MenuItem value={ACTION_TYPES.ACCOUNT}>
            Remember this for every link in this account
          </MenuItem>
        </Select>
      </FormControl>
    )
  }
}

export default ULinkORRememberInput
