import React from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { mailboxStore } from 'stores/mailbox'
import { List, ListItem, Divider } from 'material-ui'
import UnreadMailboxListItem from './UnreadMailboxListItem'
import NavigationController from 'react-navigation-controller'

const styles = {
  list: {
    paddingTop: 0,
    paddingBottom: 0
  }
}

export default class UnreadScene extends React.Component {
  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxesChanged)
  }

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxesChanged)
  }

  /* **************************************************************************/
  // Data Lifecycle
  /* **************************************************************************/

  state = (() => {
    const mailboxState = mailboxStore.getState()

    return {
      mailboxIds: mailboxState.mailboxIds()
    }
  })()

  mailboxesChanged = (mailboxState) => {
    this.setState({
      mailboxIds: mailboxState.mailboxIds()
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const { ...passProps } = this.props
    const { mailboxIds } = this.state

    return (
      <NavigationController
        ref="NC"
        views={[
          (
            <List style={styles.list}>
              {mailboxIds.length ? (
                mailboxIds.reduce((acc, id, index, arr) => {
                  return acc.concat([
                    (<UnreadMailboxListItem key={id} mailboxId={id} onClick={() => {
                      console.log("ONCLICK")
                      this.refs.NC.pushView((
                        <List>
                          <ListItem onClick={() => this.refs.NC.popView()}>1</ListItem>
                          <ListItem>1</ListItem>
                          <ListItem>1</ListItem>
                          <ListItem>1</ListItem>
                        </List>
                      ))
                    }} />),
                    index === arr.length - 1 ? undefined : (<Divider key={`inset-${id}`} />)
                  ])
                }, [])
              ) : (
                <div>{"none"}</div>
              )}
            </List>
          )
        ]}
      />
    )


    return (
      <div {...passProps}>
        <List style={styles.list}>
          {mailboxIds.length ? (
            mailboxIds.reduce((acc, id, index, arr) => {
              return acc.concat([
                (<UnreadMailboxListItem key={id} mailboxId={id} />),
                index === arr.length - 1 ? undefined : (<Divider key={`inset-${id}`} />)
              ])
            }, [])
          ) : (
            <div>{"none"}</div>
          )}
          {}
        </List>
      </div>
    )
  }
}
