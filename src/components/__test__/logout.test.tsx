/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import snapshotRender from 'react-test-renderer';
import { useSelector } from 'react-redux';
import { logoutAction } from '../../redux/auth';
import { cleanup, fireEvent, screen, render as domRender } from '@testing-library/react';
import Logout from '../Logout';


jest.mock('@azure/msal-browser');
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: () => jest.fn(),
}));



describe('Snapshot test', () => {
  test('normal', () => {
    // @ts-ignore
    useSelector.mockReturnValue(false);
    const tree = snapshotRender.create(<Logout />).toJSON();
    expect(tree).toMatchSnapshot('normal');
  });

  test('loading', () => {
    // @ts-ignore
    useSelector.mockReturnValue(true);
    const tree = snapshotRender.create(<Logout />).toJSON();
    expect(tree).toMatchSnapshot('loading');
  });
});



jest.mock('../../redux/auth', () => ({ logout: jest.fn() }));
describe('Event test', () => {
  afterEach(cleanup);


  test('Click button', () => {
    // @ts-ignore
    useSelector.mockReturnValue(false);
    domRender(<Logout />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // @ts-ignore
    expect(logoutAction.mock.calls.length).toEqual(1);
  });


  test('Click button on loading', () => {
    // @ts-ignore
    useSelector.mockReturnValue(true);
    domRender(<Logout />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // @ts-ignore
    expect(logoutAction.mock.calls.length).toEqual(0);
  });
});
