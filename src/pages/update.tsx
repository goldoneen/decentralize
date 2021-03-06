import React, { useMemo } from 'react'

import { useLocation } from '@gatsbyjs/reach-router'
import NotFound from 'decentraland-gatsby/dist/components/Layout/NotFound'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Container } from 'decentraland-ui/dist/components/Container/Container'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Loader } from 'decentraland-ui/dist/components/Loader/Loader'

import ContentLayout, { ContentSection } from '../components/Layout/ContentLayout'
import UpdateMarkdownView from '../components/Updates/UpdateMarkdownView'
import useProposal from '../hooks/useProposal'
import useProposalUpdate from '../hooks/useProposalUpdate'
import useProposalUpdates from '../hooks/useProposalUpdates'
import locations from '../modules/locations'

import './update.css'

export default function UpdateDetail() {
  const t = useFormatMessage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const updateId = params.get('id')
  const { update, state: updateState } = useProposalUpdate(updateId)
  const [proposal, proposalState] = useProposal(update?.proposal_id)
  const { publicUpdates, state: updatesState } = useProposalUpdates(update?.proposal_id)

  if (updateState.loading || updatesState.loading || proposalState.loading) {
    return (
      <Container>
        <Loader size="huge" active />
      </Container>
    )
  }

  if (updateState.error || proposalState.error || updatesState.error) {
    return (
      <ContentLayout className="ProposalDetailPage">
        <NotFound />
      </ContentLayout>
    )
  }

  const index = publicUpdates && publicUpdates.length - Number(publicUpdates?.findIndex((item) => item.id === updateId))

  return (
    <ContentLayout navigateHref={update ? locations.proposal(update.proposal_id) : undefined} small>
      <ContentSection className="UpdateDetail__Header">
        <span className="UpdateDetail__ProjectTitle">
          {t('page.update_detail.project_title', { title: proposal?.title })}
        </span>
        <Header size="huge">{t('page.update_detail.title', { index })}</Header>
      </ContentSection>
      {update && <UpdateMarkdownView update={update} proposalUser={proposal?.user} />}
    </ContentLayout>
  )
}
