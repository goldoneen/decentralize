import React from 'react'

import Markdown from 'decentraland-gatsby/dist/components/Text/Markdown'
import Paragraph from 'decentraland-gatsby/dist/components/Text/Paragraph'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import Time from 'decentraland-gatsby/dist/utils/date/Time'
import { Profile } from 'decentraland-gatsby/dist/utils/loader/profile'
import { Header } from 'decentraland-ui/dist/components/Header/Header'

import { UpdateStatus } from '../../entities/Updates/types'
import { UpdateAttributes } from '../../entities/Updates/types'
import { formatDate } from '../../modules/time'
import Date from '../Common/Date'
import { ContentSection } from '../Layout/ContentLayout'
import Divider from '../Section/Divider'
import Username from '../User/Username'

import ProjectHealthStatus from './ProjectHealthStatus'
import './UpdateMarkdownView.css'

interface Props {
  update: Omit<UpdateAttributes, 'id' | 'proposal_id' | 'created_at' | 'updated_at'>
  profile?: Profile | null
  proposalUser?: string
}

const UpdateMarkdownView = ({ update, proposalUser }: Props) => {
  const l = useFormatMessage()
  const formattedCompletionDate = update?.completion_date ? formatDate(update.completion_date) : ''
  const formattedDueDate = Time.utc(update?.completion_date).from(Time.utc(update?.due_date), true)

  return (
    <ContentSection className="UpdateDetail__Content">
      {update?.health && <ProjectHealthStatus health={update.health} />}
      <Header as="h2">{l('page.update_detail.introduction')}</Header>
      <Markdown>{update?.introduction || ''}</Markdown>
      <Header as="h2">{l('page.update_detail.highlights')}</Header>
      <Markdown>{update?.highlights || ''}</Markdown>
      <Header as="h2">{l('page.update_detail.blockers')}</Header>
      <Markdown>{update?.blockers || ''}</Markdown>
      <Header as="h2">{l('page.update_detail.next_steps')}</Header>
      <Markdown>{update?.next_steps || ''}</Markdown>
      {update?.additional_notes && (
        <>
          <Header as="h2">{l('page.update_detail.additional_notes')}</Header>
          <Markdown>{update?.additional_notes}</Markdown>
        </>
      )}
      {proposalUser && update.completion_date && (
        <>
          <Divider size="small" />
          <div className="UpdateDetail__Date">
            <div className="UpdateDetail__CompletionDate">
              <Paragraph>
                <Date date={update.completion_date}>
                  {l('page.update_detail.completion_date', { date: formattedCompletionDate })}
                </Date>
              </Paragraph>
              {proposalUser && <Username address={proposalUser} linked />}
            </div>
            {update?.status === UpdateStatus.Late && (
              <Markdown>{l('page.update_detail.due_date', { date: formattedDueDate }) || ''}</Markdown>
            )}
          </div>
        </>
      )}
    </ContentSection>
  )
}

export default UpdateMarkdownView
