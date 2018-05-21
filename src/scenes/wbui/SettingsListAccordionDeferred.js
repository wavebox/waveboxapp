import PropTypes from 'prop-types'
import React from 'react'
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import SettingsListContainer from './SettingsListContainer'
import grey from '@material-ui/core/colors/grey'
import SettingsListSectionTitle from './SettingsListSectionTitle'

const styles = {
  panelSummary: {
    minHeight: 36,
    fontSize: '0.8125rem'
  },
  panelSummaryContent: {
    marginTop: 8,
    marginBottom: 8
  },
  panelDetails: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 0
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 'inherit',
    flexBasis: '33.33%',
    flexShrink: 0
  },
  secondaryHeading: {
    color: grey[500],
    fontSize: 'inherit'
  }
}

@withStyles(styles)
class SettingsListAccordionDeferred extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    ...SettingsListSectionTitle.propTypes,
    panels: PropTypes.array
  }

  /* **************************************************************************/
  // Component lifecycle
  /* **************************************************************************/

  componentDidMount () {
    this.renderTO = null
    this.renderTO2 = null
  }

  componentWillUnmount () {
    clearTimeout(this.renderTO)
    clearTimeout(this.renderTO2)
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = {
    expandedRender: new Set(),
    expanded: false
  }

  /* **************************************************************************/
  // UI Events
  /* **************************************************************************/

  expandPanel = (evt, panelId) => {
    this.setState((prevState) => {
      clearTimeout(this.renderTO)
      clearTimeout(this.renderTO2)
      const isExpanded = prevState.expanded === panelId

      if (isExpanded) {
        this.renderTO = setTimeout(() => {
          this.setState({ expandedRender: new Set() })
        }, 400)
        return { expanded: false }
      } else {
        const nextRender = new Set([panelId].concat(Array.from(prevState.expandedRender)))
        const finalRender = new Set([panelId])
        this.renderTO = setTimeout(() => {
          this.setState({ expanded: panelId })
        }, 10)
        this.renderTO2 = setTimeout(() => {
          this.setState({ expandedRender: finalRender })
        }, 400)

        return { expandedRender: nextRender }
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
    const {
      classes,
      panels,
      title,
      subtitle,
      icon,
      ...passProps
    } = this.props
    const { expanded, expandedRender } = this.state

    return (
      <SettingsListContainer {...passProps}>
        <SettingsListSectionTitle title={title} subtitle={subtitle} icon={icon} />
        {panels.map((panel, index) => {
          const panelId = `panel-${index}`
          const isExpanded = expanded === panelId
          return (
            <ExpansionPanel
              key={panelId}
              expanded={isExpanded}
              onChange={(evt) => this.expandPanel(evt, panelId)}>
              <ExpansionPanelSummary
                className={classes.panelSummary}
                classes={{ content: classes.panelSummaryContent }}
                expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{panel.title}</Typography>
                <Typography className={classes.secondaryHeading}>{panel.subtitle}</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.panelDetails}>
                {expandedRender.has(panelId) ? panel.render() : <div />}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        })}
      </SettingsListContainer>
    )
  }
}

export default SettingsListAccordionDeferred
