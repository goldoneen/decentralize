import React from 'react'
import { Page } from 'decentraland-ui/dist/components/Page/Page'
import linkify from 'react-linkify/dist/decorators/defaultMatchDecorator'
import Grid from 'semantic-ui-react/dist/commonjs/collections/Grid'
import { Props } from './ProposalPage.types'
import { Navbar } from 'components/Navbar'
import { Footer } from 'components/Footer'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import { Back } from 'decentraland-ui/dist/components/Back/Back'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { ProposalHistory } from 'components/Proposal/ProposalHistory'
import { ProposalStatus } from 'components/Proposal/ProposalStatus'
import { AppName, BanName, Catalyst, POI } from 'modules/app/types'
import { getVoteTimeLeft, getProposalUrl, getDelayTimeLeft } from 'modules/proposal/utils'
import { Button } from 'decentraland-ui/dist/components/Button/Button'
import { ProposalTitle } from 'components/Proposal/ProposalTitle'
import { ProposalSupportModal } from 'components/Proposal/ProposalSupportModal'
import { env } from 'decentraland-commons'
import { getProposalInitialAddress } from 'modules/description/utils'
import { getAppName, isApp } from 'modules/app/utils'
import inspect from 'util-inspect'
import { AggregatedVote, DelayedScript, ProposalType } from 'modules/proposal/types'
import './ProposalPage.css'
import { locations } from 'routing/locations'
import Tooltip from 'components/Tooltip'
import { ProposalAction } from 'components/Proposal/ProposalAction'

export default class ProposalPage extends React.PureComponent<Props, any> {

  componentDidMount() {
    if (this.props.proposal && !Array.isArray(this.props.casts)) {
      this.props.onRequireCasts([this.props.proposal.id])
    }

    if (this.props.proposal && !this.props.balance) {
      this.props.onRequireBalance([this.props.proposal.id])
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.proposal && this.props.proposal !== prevProps.proposal) {
      this.props.onRequireCasts([this.props.proposal.id])
      this.props.onRequireBalance([this.props.proposal.id])
    }
  }

  handleBack = () => {
    if (this.props.canGoBack) {
      this.props.onBack()
    } else {
      this.props.onHome()
    }
  }

  handleWrap = () => {
    this.props.onNavigate(locations.wrapping())
  }

  handleApprove = () => {
    if (this.props.proposal) {
      this.props.onNavigate(getProposalUrl(this.props.proposal, { modal: 'vote', support: true }), true)
    }
  }

  handleReject = () => {
    if (this.props.proposal) {
      this.props.onNavigate(getProposalUrl(this.props.proposal, { modal: 'vote', support: false }), true)
    }
  }

  handleSwitch = () => {
    if (this.props.proposal && this.props.cast) {
      const support = !this.props.cast.supports
      this.props.onNavigate(getProposalUrl(this.props.proposal, { modal: 'vote', support }), true)
    }
  }

  handleExecute = () => {
    if (this.props.proposal && this.props.proposal.proposalType === ProposalType.DelayScript) {
      this.props.onExecuteScript(this.props.proposal.id)
    }
  }

  handleEnact = () => {
    if (this.props.proposal && this.props.proposal.proposalType !== ProposalType.DelayScript) {
      this.props.onExecuteVote(this.props.proposal.id)
    }
  }

  renderVotingPowerTooltip() {
    const balance = this.props.balance || 0
    const vote = this.props.proposal as AggregatedVote
    const startDate = new Date(Number(vote.startDate + '000'))
    const snapshotBlock = vote.snapshotBlock

    return <Tooltip
      position="bottom center"
      content={t('proposal_detail_page.voting_power_detail', { snapshotBlock, startDate })}
      trigger={<Header sub>
        {t('proposal_detail_page.voting_power', { vp: balance })}
        <Tooltip.Icon />
      </Header>}
    />
  }

  renderTitle() {
    return <Grid.Row>
      <Grid.Column mobile="16" className="ProposalTitle">
        <ProposalTitle proposal={this.props.proposal} primary />
      </Grid.Column>
    </Grid.Row>
  }

  renderLoading() {
    return <Card>
      <Loader active size="medium" />
    </Card>
  }

  renderCategory() {
    const { proposal, description } = this.props

    if ((proposal as AggregatedVote).metadata) {
      return <Header>{AppName.Question}</Header>
    }

    const category = getAppName(getProposalInitialAddress(description))
    if (category) {
      return <Header>{category}</Header>
    }

    return <Header>{AppName.System}</Header>
  }

  renderVoteDetail() {
    const vote = this.props.proposal as AggregatedVote

    return <Grid.Row className="ProposalDetail">
      <Grid.Column mobile="3">
        <Header sub>{t('proposal_detail_page.category')}</Header>
        {this.renderCategory()}
      </Grid.Column>
      <Grid.Column mobile="4">
        <Header sub>{t('proposal_detail_page.left')}</Header>
        <Header>{getVoteTimeLeft(vote) || t('proposal_detail_page.ready')}</Header>
      </Grid.Column>
      <Grid.Column mobile="4">
        <Tooltip content={t('proposal_detail_page.support_detail')} trigger={<Header sub>{t('proposal_detail_page.support')} <Tooltip.Icon /></Header>} />
        <Header>{vote.balance.supportPercentage || 0} %</Header>
        <span>{t('proposal_detail_page.percentage_needed', { needed: vote.balance.supportRequiredPercentage || 0 })}</span>
      </Grid.Column>
      <Grid.Column mobile="5">
        <Tooltip content={t('proposal_detail_page.approval_detail')} trigger={<Header sub>{t('proposal_detail_page.approval')} <Tooltip.Icon /></Header>} />
        <Header>{vote.balance.approvalPercentage || 0} %</Header>
        <span>{t('proposal_detail_page.percentage_needed', { needed: vote.balance.approvalRequiredPercentage || 0 })}</span>
      </Grid.Column>
      {/* <Grid.Column mobile="5">
        <Tooltip content={t('proposal_detail_page.approval_detail')} trigger={<Header sub>{t('proposal_detail_page.approval')} <Tooltip.Icon /></Header>} />
        <Header>{t('general.number',{ value: vote.balance.yea || 0 })}</Header>
        <span>{t('proposal_detail_page.amount_needed', { needed: vote.balance.approvalRequired || 0 })}</span>
      </Grid.Column> */}
    </Grid.Row>
  }

  renderDelayDetail() {
    const { isExecuting, executed } = this.props
    const delayedScript = this.props.proposal as DelayedScript
    const paused = !!delayedScript.pausedAt
    const ready = !paused && (delayedScript.executionTime * 100) < Date.now()

    return <Grid.Row className="ProposalDetail">
      <Grid.Column mobile="4">
        <Header sub>{t('proposal_detail_page.category')}</Header>
        {this.renderCategory()}
      </Grid.Column>
      <Grid.Column mobile="5">
        <Header sub>{t('proposal_detail_page.left')}</Header>
        <Header>
          {getDelayTimeLeft(delayedScript) || t('proposal_detail_page.pending_execution')}
        </Header>
      </Grid.Column>
      <Grid.Column mobile="7">
        {paused && <Button primary reverted disabled>{t('general.paused')}</Button>}
        {!paused && !ready && <Button disabled>{t('general.under_review')}</Button>}
        {!paused && ready && !executed && <Button
          loading={isExecuting}
          primary={delayedScript.canExecute}
          disabled={!delayedScript.canExecute}
          onClick={this.handleExecute}
        >
          {t('general.execute')}
        </Button>}
        {!paused && ready && executed && <Button disabled>{t('general.executed')}</Button>}
      </Grid.Column>
    </Grid.Row>
  }

  renderVoteProgress() {
    const vote = this.props.proposal as AggregatedVote

    return <Grid.Row className="ProposalProgress">
      <Grid.Column mobile="16">
        <ProposalStatus.Progress proposal={vote} full />
      </Grid.Column>
    </Grid.Row>
  }

  renderVoteActions() {
    const vote = this.props.proposal as AggregatedVote

    return <Grid.Row className="ProposalActions">
      <Grid.Column mobile="7">
        <ProposalStatus.Approval proposal={vote} />
      </Grid.Column>
      <Grid.Column mobile="9">
        <ProposalAction
          vote={vote}
          onClickApprove={this.handleApprove}
          onClickReject={this.handleReject}
          onClickEnact={this.handleEnact}
        />
      </Grid.Column>
    </Grid.Row>
  }

  renderDescription() {
    const { description, proposal } = this.props
    const initialApp = getProposalInitialAddress(description)
    const isPOI = !!initialApp && isApp(initialApp, POI)
    const isBanName = !!initialApp && isApp(initialApp, BanName)
    const isCatalyst = !!initialApp && isApp(initialApp, Catalyst)

    if (isPOI || isBanName || isCatalyst) {
      return <Card.Content className="DetailDescription">
        <Header sub>{t('proposal_detail_page.description')}</Header>
        {isPOI && <Card.Description>{t('proposal_detail_page.description_poi')}</Card.Description>}
        {isBanName && <Card.Description>{t('proposal_detail_page.description_ban')}</Card.Description>}
        {isCatalyst && <Card.Description>{t('proposal_detail_page.description_catalyst')}</Card.Description>}
      </Card.Content>
    }

    const links = linkify((proposal as AggregatedVote)?.metadata || '')
    if (links.length > 0) {

    }

    return null
  }

  render() {
    const { isLoading, proposal, description, casts, cast } = this.props

    return <>
      <Navbar isFullscreen={false} />
      <Page className="ProposalPage">
        <ProposalSupportModal proposal={proposal} cast={cast} />
        <div className="ProposalPageBack">
          <Back onClick={this.handleBack} />
        </div>
        <Grid stackable>
          {this.renderTitle()}
          <Grid.Row>
            <Grid.Column mobile="11">
              <Header sub>{t('proposal_detail_page.detail')}</Header>
              {isLoading && this.renderLoading()}
              {!isLoading && proposal && <Card>
                {proposal.proposalType === ProposalType.Vote && <Card.Content>
                  <Grid stackable>
                    {this.renderVoteDetail()}
                    {this.renderVoteProgress()}
                    {this.renderVoteActions()}
                  </Grid>
                </Card.Content>}
                {proposal.proposalType === ProposalType.DelayScript && <Card.Content>
                  <Grid stackable>
                    {this.renderDelayDetail()}
                  </Grid>
                </Card.Content>}
                {this.renderDescription()}
                {env.isDevelopment() && <Card.Content className="DetailDebug">
                  <Header sub>INFO</Header>
                  {<div className="DetailDebugContainer">
                    <pre>{inspect(linkify((proposal as AggregatedVote)?.metadata || ''), null, 2)}</pre>
                  </div>}
                  <div className="DetailDebugContainer">
                    <pre>{inspect(proposal, null, 2)}</pre>
                  </div>
                  <div className="DetailDebugContainer">
                    <pre>{JSON.stringify(description, null, 2)}</pre>
                  </div>
                  <div className="DetailDebugContainer">
                    <pre>{inspect(casts, null, 2)}</pre>
                  </div>
                </Card.Content>}
              </Card>}
            </Grid.Column>
            <Grid.Column mobile="5">
              <Header sub>{t('proposal_detail_page.history')}</Header>
              {isLoading && this.renderLoading()}
              {!isLoading && proposal && <ProposalHistory proposal={proposal} />}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Page>
      <Footer />
    </>
  }
}
