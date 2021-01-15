import React from 'react';
import ReactDOM from 'react-dom';
import * as PopupControl from '../controls/popup';

const model = {};

function Options(props) {
  const { control, model } = props;
  return (<div onClick={control.handleClick}>Options</div>);
}

// eslint-disable-next-line react/jsx-filename-extension
ReactDOM.render(<Options control={PopupControl} model={model} />, document.querySelector('#root'));
