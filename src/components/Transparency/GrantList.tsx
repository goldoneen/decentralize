import React, { useMemo } from 'react'
import { Header } from 'decentraland-ui/dist/components/Header/Header'
import { Card } from 'decentraland-ui/dist/components/Card/Card'
import useFormatMessage from 'decentraland-gatsby/dist/hooks/useFormatMessage'
import { Link } from 'gatsby-plugin-intl'
import locations from '../../modules/locations'
import { ProposalType, ProposalStatus } from '../../entities/Proposal/types'
import { DetailItem } from '../Section/DetailItem'
import useProposals from '../../hooks/useProposals'
import './GrantList.css'
import { formatBalance } from '../../entities/Proposal/utils'

export type GrantListProps = React.HTMLAttributes<HTMLDivElement> & {
  status: ProposalStatus,
  title: string
}

const ITEMS_PER_PAGE = 5

export default React.memo(function GrantList({status, title }: GrantListProps) {
  const l = useFormatMessage()
  const [grantsList] = useProposals({
    type: ProposalType.Grant,
    status: status,
    page: 1,
    itemsPerPage: ITEMS_PER_PAGE
  })
  const additionalGrants = useMemo(() => !!grantsList ? (grantsList.total - grantsList.data.length) : 0, [grantsList])

  return <>
    {grantsList && <Card.Content className="GrantList__Content">
      <Header size="medium" className="GrantList__Total">{grantsList.total}</Header>
      <Header sub className="GrantList__Sub">{title}</Header>
      <div className="ItemsList">
        {grantsList.data && grantsList.data.map((grant, index) => {
          return <DetailItem name={grant.title}
                             value={'$' + formatBalance(grant.configuration.size)}
                             key={[title.trim(), index].join('::')} />
        })}
        {additionalGrants > 0 && <Link
          to={locations.proposals({ type: ProposalType.Grant, status: status })}
          className="GrantList__Link">
          {l('page.transparency.funding.view_more', {count: additionalGrants})}
        </Link>}
      </div>
    </Card.Content>}
  </>
})
