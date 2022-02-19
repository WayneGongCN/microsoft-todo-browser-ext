import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ITasklistResult } from '../../types';
import request from '../helpers/request';

/**
 * 获取 Tasklist 列表
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todo-list-lists.md
 */
export const fetchTasklist = createAsyncThunk<ITasklistResult>('task/fetTasklist', (_, { rejectWithValue }) =>
  request.get<void, ITasklistResult>('me/todo/lists').catch((e) => rejectWithValue(e.serializ()))
);

const tasklistSlice = createSlice({
  name: 'tasklist',

  initialState: {
    lists: [] as ITasklistResult['value'],
    loading: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // getTasklist
      .addCase(fetchTasklist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasklist.fulfilled, (state, { payload }) => {
        state.lists = payload.value;
        state.loading = false;
      })
      .addCase(fetchTasklist.rejected, (state) => {
        state.lists = [];
        state.loading = false;
      });
  },
});

export default tasklistSlice;
