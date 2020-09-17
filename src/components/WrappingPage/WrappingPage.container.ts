import { connect } from 'react-redux'
import { connectWalletRequest } from 'decentraland-dapps/dist/modules/wallet/actions'
import { isConnected, isConnecting, isEnabling } from 'decentraland-dapps/dist/modules/wallet/selectors'

import WrappingPage from './WrappingPage'
import { RootState } from 'modules/root/types'
import { MapDispatchProps, MapStateProps, MapDispatch } from './WrappingPage.types'
import { getData, isLoading, isAllowingEstate, isAllowingLand, isAllowingMana, isWrappingMana, isUnwrappingMana, isRevokingLand, isRevokingEstate } from 'modules/wallet/selectors'
import { allowLandRequest, allowEstateRequest, wrapManaRequest, allowManaRequest, revokeLandRequest, revokeEstateRequest } from 'modules/wallet/actions'
import { push, replace } from 'connected-react-router'

const mapState = (state: RootState): MapStateProps => {
  return ({
    isConnected: isConnected(state),
    isConnecting: isConnecting(state),
    isEnabling: isEnabling(state),
    isLoading: isConnecting(state) || isEnabling(state) || isLoading(state),
    isAllowingMana: isAllowingMana(state),
    isAllowingLand: isAllowingLand(state),
    isAllowingEstate: isAllowingEstate(state),
    isRevokingLand: isRevokingLand(state),
    isRevokingEstate: isRevokingEstate(state),
    isWrappingMana: isWrappingMana(state),
    isUnwrappingMana: isUnwrappingMana(state),
    wallet: getData(state)
  })
}

const mapDispatch = (dispatch: MapDispatch): MapDispatchProps => ({
  onConnect: () => dispatch(connectWalletRequest()),
  onNavigate: (href: string, r: boolean = false) => dispatch(r ? replace(href) : push(href)),
  onWrapMana: (amount) => dispatch(wrapManaRequest(amount)),
  onUnwrapMana: (amount) => dispatch(wrapManaRequest(amount)),
  onAllowMana: () => dispatch(allowManaRequest()),
  onAllowLand: () => dispatch(allowLandRequest()),
  onAllowEstate: () => dispatch(allowEstateRequest()),
  onRevokeLand: () => dispatch(revokeLandRequest()),
  onRevokeEstate: () => dispatch(revokeEstateRequest())
})

export default connect(mapState, mapDispatch)(WrappingPage)
