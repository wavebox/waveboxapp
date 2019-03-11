import React from 'react'
import { accountStore, accountActions } from 'stores/account'
import { settingsStore } from 'stores/settings'
import SidelistItemMailbox from './SidelistItemMailbox'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import shallowCompare from 'react-addons-shallow-compare'
import uuid from 'uuid'
import ThemeTools from 'wbui/Themes/ThemeTools'

const SortableItem = SortableElement(({ mailboxId, sortableGetScrollContainer }) => {
  // Only return native dom component here, otherwise adding and removing
  // becomes super-buggy!
  return (
    <div>
      <SidelistItemMailbox
        mailboxId={mailboxId}
        sortableGetScrollContainer={sortableGetScrollContainer} />
    </div>
  )
})

const SortableList = SortableContainer(({ mailboxIds, disabled, sortableGetScrollContainer }) => {
  return (
    <div>
      {mailboxIds.map((mailboxId, index) => (
        <SortableItem
          key={mailboxId}
          index={index}
          mailboxId={mailboxId}
          disabled={disabled}
          sortableGetScrollContainer={sortableGetScrollContainer}
          collection='Singleton_SidelistMailboxes' />
      ))}
    </div>
  )
})

const styles = (theme) => {
  return {
    rootNoScrollbar: {
      // Linux overflow fix for https://github.com/wavebox/waveboxapp/issues/712.
      // Seems to only reproduce on certain pages (e.g. gmail)
      ...(process.platform === 'linux' ? {
        overflowY: 'hidden',
        '&:hover': { overflowY: 'auto' }
      } : {
        overflowY: 'auto'
      }),
      '&::-webkit-scrollbar': { display: 'none' }
    },
    rootWithScrollbar: {
      WebkitAppRegion: 'no-drag', // Drag region interfers with scrollbar drag

      // Linux overflow fix for https://github.com/wavebox/waveboxapp/issues/712.
      // Seems to only reproduce on certain pages (e.g. gmail)
      ...(process.platform === 'linux' ? {
        overflowY: 'hidden',
        '&:hover': { overflowY: 'overlay' }
      } : {
        overflowY: 'overlay'
      }),

      '&::-webkit-scrollbar': {
        WebkitAppearance: 'none',
        width: 7,
        height: 7
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: ThemeTools.getValue(theme, 'wavebox.sidebar.scrollbar.track.backgroundColor'),
        borderRadius: 4
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        backgroundColor: ThemeTools.getValue(theme, 'wavebox.sidebar.scrollbar.thumb.backgroundColor'),
        boxShadow: ThemeTools.getValue(theme, 'wavebox.sidebar.scrollbar.thumb.boxShadow')
      }
    }
  }
}

@withStyles(styles, { withTheme: true })
class SidelistMailboxes extends React.Component {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor (props) {
    super(props)

    this.instanceId = uuid.v4()

    // On Electron4+ the webview gobbles mouse events when dragging over it
    // meaning that sidebar items can't be fluidly dragged. We can either
    // set the pointer-events to be none on the webview, or cover it
    // with a div.
    // Fixes #962
    this.shield = document.createElement('div')
    this.shield.style.position = 'fixed'
    this.shield.style.top = '0px'
    this.shield.style.left = '0px'
    this.shield.style.right = '0px'
    this.shield.style.bottom = '0px'
    this.shield.addEventListener('click', (evt) => {
      // Fallback
      try {
        document.body.removeChild(this.shield)
      } catch (ex) { }
    }, false)
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
    settingsStore.listen(this.settingsChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
    settingsStore.unlisten(this.settingsChanged)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const settingsState = settingsStore.getState()
    return {
      mailboxIds: accountStore.getState().mailboxIds(),
      disabled: settingsState.ui.lockSidebarsAndToolbars,
      showScrollbar: settingsState.ui.showSidebarScrollbars
    }
  })()

  accountChanged = (accountState) => {
    this.setState({ mailboxIds: accountState.mailboxIds() })
  }

  settingsChanged = (settingsState) => {
    this.setState({
      disabled: settingsState.ui.lockSidebarsAndToolbars,
      showScrollbar: settingsState.ui.showSidebarScrollbars
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { className, classes, theme, ...passProps } = this.props
    const { mailboxIds, disabled, showScrollbar } = this.state

    return (
      <div
        {...passProps}
        data-instance-id={this.instanceId}
        className={classNames(showScrollbar ? classes.rootWithScrollbar : classes.rootNoScrollbar, 'WB-Sidelist-Mailboxes', className)}>
        <SortableList
          axis='y'
          distance={5}
          mailboxIds={mailboxIds}
          disabled={disabled}
          getContainer={() => {
            // Fix for https://github.com/wavebox/waveboxapp/issues/713
            return document.querySelector(`[data-instance-id="${this.instanceId}"]`)
          }}
          sortableGetScrollContainer={() => {
            // Fix for https://github.com/wavebox/waveboxapp/issues/713
            return document.querySelector(`[data-instance-id="${this.instanceId}"]`)
          }}
          shouldCancelStart={(evt) => {
            // Fix for https://github.com/wavebox/waveboxapp/issues/762
            if (evt.ctrlKey === true) { return true }
          }}
          onSortStart={() => {
            document.body.appendChild(this.shield)
          }}
          onSortEnd={({ oldIndex, newIndex }) => {
            accountActions.changeMailboxIndex(mailboxIds[oldIndex], newIndex)
            try {
              document.body.removeChild(this.shield)
            } catch (ex) { }
          }} />
      </div>
    )
  }
}

export default SidelistMailboxes
