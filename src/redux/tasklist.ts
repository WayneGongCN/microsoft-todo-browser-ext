import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ITasklistResult, ITasksResult } from '../../types';
import { bindAsyncActions } from '../helpers';
import request from '../helpers/request';

/**
 * 获取 Tasklist 列表
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todo-list-lists.md
 */
export const getTasklist = createAsyncThunk<ITasklistResult>('task/fetTasklist', (_, { rejectWithValue }) =>
  request.get<void, ITasklistResult>('me/todo/lists').catch((e) => rejectWithValue(e.serializ()))
);

/**
 * 获取 Tasklist 下的 Task
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-list-tasks.md
 */
export const getTasksByTasklistId = createAsyncThunk<ITasksResult, string>('task/getTask', (tasklistId, { rejectWithValue }) =>
  request.get<void, ITasksResult>(`me/todo/lists/${tasklistId}/tasks`).catch((e) => {
    rejectWithValue(e.serializ());
    return Promise.reject(e);
  })
);

/**
 * 获取 Task
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotask-get.md
 */
export const getTaskById = createAsyncThunk<ITasklistResult, { tasklistId: string; taskId: string }>(
  'task/getTask',
  ({ tasklistId, taskId }, { rejectWithValue }) =>
    request.get<void, ITasklistResult>(`me/todo/lists/${tasklistId}/tasks/${taskId}`).catch((e) => {
      rejectWithValue(e.serializ());
      return Promise.reject(e);
    })
);

export const tasklistSlice = createSlice({
  name: 'tasklist',

  initialState: {
    lists: [] as ITasklistResult['value'],
    quickAddTasklistId: null as null | string,
    loading: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // getTasklist
      .addCase(getTasklist.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTasklist.fulfilled, (state, { payload }) => {
        state.lists = payload.value;
        state.quickAddTasklistId = payload.value[0].id;
        state.loading = false;
      })
      .addCase(getTasklist.rejected, (state) => {
        state.lists = [];
        state.loading = false;
      });
  },
});

export const asyncChunk = {
  getTasklist,
  getTaskById,
  getTasksByTasklistId,
};
bindAsyncActions(tasklistSlice, asyncChunk);

export default tasklistSlice;
