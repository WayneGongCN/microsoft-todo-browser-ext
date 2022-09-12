import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { getTodolistsRequest, ITodolistsResult } from '../api/getTodolists';
import { getPersistConf } from '../helpers';



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
      /**
       * getTasklist
       */
      .addCase(fetchTasklistAction.pending, (state) => {
        state.loading = !state.lists.length;
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



const persistConfig = getPersistConf({ key: 'tasklist', whitelist: ['lists'] })
export const persistTasklistReducer = persistReducer(persistConfig, tasklistSlice.reducer)

export default tasklistSlice;
