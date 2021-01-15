import React from 'react';
import PropTypes from 'prop-types';

function Popup(props) {
  const { handleClick, handleKeyUp } = props;
  return <button type="submit" onClick={handleClick} onKeyUp={handleKeyUp}>Click me!</button>;
}

Popup.propTypes = {
  handleClick: PropTypes.func,
  handleKeyUp: PropTypes.func,
};

Popup.defaultProps = {
  handleClick: () => {},
  handleKeyUp: () => {},
};

export default Popup;
