import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getTodolistsRequest, ITodolistsResult } from '../api/getTodolists';

/**
 * 获取 Tasklist 列表
 */
export const fetchTasklistAction = createAsyncThunk<ITodolistsResult>('task/fetTasklist', (_, { rejectWithValue }) => {
  return getTodolistsRequest().catch((e) => rejectWithValue(e.serializ()))
});



const tasklistSlice = createSlice({
  name: 'tasklist',

  initialState: {
    lists: [] as ITodolistsResult['value'],
    loading: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // getTasklist
      .addCase(fetchTasklistAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasklistAction.fulfilled, (state, { payload }) => {
        state.lists = payload.value;
        state.loading = false;
      })
      .addCase(fetchTasklistAction.rejected, (state) => {
        state.lists = [];
        state.loading = false;
      });
  },
});

export default tasklistSlice;
