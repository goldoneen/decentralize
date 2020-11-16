import { put, call, select, fork, takeEvery } from 'redux-saga/effects'
import { describePath, decodeForwardingPath, App } from '@aragon/connect'
import { loadProposalDescriptionFailure, loadProposalDescriptionSuccess } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization } from 'modules/organization/types'
import { ForwardingPathDescription, ProposalDescription } from './types'
import { getData as getVoteDescriptions } from './selectors'
import { LOAD_PROPOSALS_SUCCESS, LoadProposalsSuccessAction } from 'modules/proposal/actions'
import { getApps } from 'modules/app/selectors'
import { concurrent } from 'modules/common/utils'
import { Proposal } from 'modules/proposal/types'
import { createDescription } from './utils'
import { isProposalExecutable } from 'modules/proposal/utils'

export function* voteDescriptionSaga() {
  yield takeEvery(LOAD_PROPOSALS_SUCCESS, loadProposalDescriptions)
}

function* loadProposalDescriptions(action: LoadProposalsSuccessAction) {
  const proposalDescriptions: Record<string, ProposalDescription> = yield select(getVoteDescriptions)
  for (const [id, proposal] of Object.entries(action.payload.votes)) {
    const proposalDescription = proposalDescriptions[id]
    if (proposal && !proposalDescription) {
      yield fork(loadProposalDescription, proposal)
    }
  }
}

function* loadProposalDescription(proposal: Proposal) {
  try {
    const org: Organization = yield select(getOrganization)
    const apps: App[] = yield select(getApps)

    if (!isProposalExecutable(proposal)) {
      yield put(loadProposalDescriptionSuccess({ [proposal.id]: {} }))
    } else {
      const describedSteps: ForwardingPathDescription['describedSteps'] = yield call(concurrent(() => {
        return describePath(decodeForwardingPath(proposal.script), apps, org.connection.ethersProvider)
      }))

      const description = createDescription(describedSteps)
      yield put(loadProposalDescriptionSuccess({ [proposal.id]: description }))
    }
  } catch (err) {
    yield put(loadProposalDescriptionFailure({ [proposal.id]: err.message }))
  }
}
