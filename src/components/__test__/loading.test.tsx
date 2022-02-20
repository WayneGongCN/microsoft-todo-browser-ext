/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import snapshotRender from 'react-test-renderer';
import Loading from '../Loading';


describe('Snapshot test', () => {
  test('normal render', () => {
    const tree = snapshotRender.create(<Loading />).toJSON();
    expect(tree).toMatchSnapshot('normal');
  });
});
