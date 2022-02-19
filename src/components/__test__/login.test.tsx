import React from 'react';
import render from 'react-test-renderer'
import Login from "../Login";

it('Render', () => {
  const tree = render.create(<Login />).toJSON();

  expect(tree).toMatchSnapshot();
});