/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import snapshotRender from 'react-test-renderer';
import TranslateTip from '../TranslateTip';


describe('Snapshot test', () => {
  test('normal render', () => {
    const tree = snapshotRender.create(<TranslateTip />).toJSON();
    expect(tree).toMatchSnapshot('normal');
  });
});
