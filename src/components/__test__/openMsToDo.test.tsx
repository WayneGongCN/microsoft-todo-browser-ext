/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import snapshotRender from 'react-test-renderer';
import { openMicrosoftTodo } from '../../helpers/index';
import { cleanup, fireEvent, screen, render as domRender } from '@testing-library/react';
import OpenMSTodo from '../OpenMSToDo';


describe('Snapshot test', () => {
  test('normal', () => {
    const tree = snapshotRender.create(<OpenMSTodo />).toJSON();
    expect(tree).toMatchSnapshot('normal');
  });
});


jest.mock('../../helpers/index', () => ({ openMicrosoftTodo: jest.fn() }));
describe('Event test', () => {
  afterEach(cleanup);

  test('Click link', () => {
    domRender(<OpenMSTodo />);

    const link = screen.getByText('Microsoft To Do');
    fireEvent.click(link);

    // @ts-ignore
    expect(openMicrosoftTodo.mock.calls.length).toEqual(1);
    // @ts-ignore
    expect(openMicrosoftTodo.mock.calls[0][0]).toBe(undefined)
  });
});
