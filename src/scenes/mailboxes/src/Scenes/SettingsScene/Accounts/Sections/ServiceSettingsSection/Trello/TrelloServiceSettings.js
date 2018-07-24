import PropTypes from 'prop-types'
import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import ServiceAppearanceSection from '../Common/ServiceAppearanceSection'
import ServiceBadgeSection from '../Common/ServiceBadgeSection'
import ServiceBehaviourSection from '../Common/ServiceBehaviourSection'
import ServiceNotificationSection from '../Common/ServiceNotificationSection'
import { accountStore, accountActions } from 'stores/account'
import SettingsListSection from 'wbui/SettingsListSection'
import SettingsListItemSelect from 'wbui/SettingsListItemSelect'
import TrelloServiceReducer from 'shared/AltStores/Account/ServiceReducers/TrelloServiceReducer'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import ServiceAdvancedSection from '../Common/ServiceAdvancedSection'

export default class TrelloServiceSettings extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    serviceId: PropTypes.string.isRequired,
    showRestart: PropTypes.func.isRequired,
    onRequestEditCustomCode: PropTypes.func.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      this.setState({
        ...this.extractStateForService(nextProps.serviceId, accountStore.getState())
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    return {
      ...this.extractStateForService(this.props.serviceId, accountStore.getState())
    }
  })()

  accountChanged = (accountState) => {
    this.setState(
      this.extractStateForService(this.props.serviceId, accountState)
    )
  }

  /**
  * Gets the mailbox state config
  * @param serviceId: the id of the service
  * @param accountState: the account state
  */
  extractStateForService (serviceId, accountState) {
    const service = accountState.getService(serviceId)
    return service ? {
      hasService: true,
      homeBoardId: service.homeBoardId,
      boards: Array.from(service.boards)
    } : {
      hasService: false
    }
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { serviceId, showRestart, onRequestEditCustomCode, ...passProps } = this.props
    const {
      hasService,
      homeBoardId,
      boards
    } = this.state
    if (!hasService) { return false }

    return (
      <div {...passProps}>
        <SettingsListSection title='Account' icon={<AccountCircleIcon />}>
          <SettingsListItemSelect
            divider={false}
            label='Home board (opens on launch)'
            value={homeBoardId || 'default'}
            options={[ { value: 'default', label: 'Trello Home (Default)' } ].concat(
              boards.map((board) => {
                return { value: board.id, label: board.name }
              })
            )}
            onChange={(evt, boardId) => {
              accountActions.reduceService(
                serviceId,
                TrelloServiceReducer.setHomeBoardId,
                boardId === 'default' ? undefined : boardId
              )
            }} />
        </SettingsListSection>
        <ServiceAppearanceSection serviceId={serviceId} />
        <ServiceBadgeSection serviceId={serviceId} />
        <ServiceBehaviourSection serviceId={serviceId} />
        <ServiceNotificationSection serviceId={serviceId} />
        <ServiceAdvancedSection serviceId={serviceId} onRequestEditCustomCode={onRequestEditCustomCode} />
      </div>
    )
  }
}
