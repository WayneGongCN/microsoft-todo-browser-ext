import { connect } from 'react-redux';
import { getOAuthToken, logout } from '../actions/account';
import Account from '../components/Account';

const mapStateToProps = (state) => ({
  pending: state.account.pending,
  account: state.account.token && state.account.token.account,
});

const mapDispatchToProps = {
  handlerLogin: getOAuthToken,
  handlerLogout: logout,
};

export default connect(mapStateToProps, mapDispatchToProps)(Account);
