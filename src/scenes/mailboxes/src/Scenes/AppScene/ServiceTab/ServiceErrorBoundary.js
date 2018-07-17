import React from 'react'
import { Button } from '@material-ui/core'
import ServiceInformationCover from './ServiceInformationCover'
import RefreshIcon from '@material-ui/icons/Refresh'

class ServiceErrorBoundary extends React.Component {
  state = { hasError: false }

  componentDidCatch (error, info) {
    console.error('[ErrorBoundary]', error, info)
    this.setState({ hasError: true })
  }

  render () {
    const { hasError } = this.state
    if (hasError) {
      return (
        <ServiceInformationCover
          title='Whoops!'
          text={['Something went wrong with this tab and it crashed']}
          button={(
            <Button
              variant='raised'
              onClick={() => { this.setState({ hasError: false }) }}>
              <RefreshIcon style={{ marginRight: 6 }} />
              Reload
            </Button>
          )} />
      )
    } else {
      return this.props.children
    }
  }
}

export default ServiceErrorBoundary
