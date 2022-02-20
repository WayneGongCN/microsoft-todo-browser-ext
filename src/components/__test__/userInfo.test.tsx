/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import snapshotRender from 'react-test-renderer';
import UserInfo from '../UserInfo';
import { useSelector } from 'react-redux';


jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
describe('Snapshot test', () => {
  test('normal render', () => {
    // @ts-ignore
    useSelector.mockReturnValue({
      username: "wayne.gong.cn@hotmail.com",
    })
    const tree = snapshotRender.create(<UserInfo />).toJSON();
    expect(tree).toMatchSnapshot('normal');
  });
});
