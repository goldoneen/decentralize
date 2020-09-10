import { put, call, takeLatest, select } from 'redux-saga/effects'
import { loadAppsSuccess, loadAppsFailure, LOAD_APPS_REQUEST, loadAppsRequest } from './actions'
import { getOrganization } from 'modules/organization/selectors'
import { Organization, App } from '@aragon/connect'
import { LOAD_ORGANIZATION_SUCCESS } from 'modules/organization/actions'

export function* appSaga() {
  yield takeLatest(LOAD_ORGANIZATION_SUCCESS, reloadLoadApps)
  yield takeLatest(LOAD_APPS_REQUEST, loadApps)
}

function* reloadLoadApps() {
  yield put(loadAppsRequest())
}

function* loadApps() {
  try {
    const organization: Organization = yield select(getOrganization)
    const apps: App[] = yield call(() => organization.apps())
    const record = {} as Record<string, App>
    for (const app of apps) {
      record[app.address] = app
    }

    yield put(loadAppsSuccess(record))
  } catch (e) {
    yield put(loadAppsFailure(e.message))
  }
}