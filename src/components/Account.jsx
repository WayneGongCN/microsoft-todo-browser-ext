import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';

function Account(props) {
  const {
    pending, account, handlerLogin, handlerLogout,
  } = props;

  // eslint-disable-next-line no-shadow
  const renderAccountInfo = (account) => (
    <>
      <h2>
        Wellcome
        {account.name}
      </h2>
    </>
  );

  // eslint-disable-next-line no-shadow
  const renderSubmitBtn = (account) => {
    const submitFn = account ? handlerLogout : handlerLogin;
    const btnText = account ? 'LOGOUT' : 'LOGIN';
    return <Button color="primary" disabled={pending} pending={pending} onClick={submitFn} onKeyUp={submitFn}>{btnText}</Button>;
  };

  return (
    <>
      {account && renderAccountInfo(account)}
      {renderSubmitBtn(account)}
    </>
  );
}

Account.propTypes = {
  pending: PropTypes.bool.isRequired,
  account: PropTypes.shape({
    username: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),

  handlerLogin: PropTypes.func.isRequired,
  handlerLogout: PropTypes.func.isRequired,
};

Account.defaultProps = {
  account: null,
};

export default Account;
