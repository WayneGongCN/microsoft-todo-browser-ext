import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { State } from '.';
import { Conf, getConfRequest } from '../api/getConf';
import { getPersistConf } from '../helpers';


const SLICE_NAME = 'conf';
const APP_DEFAULT_CONF: Conf[] = [];


export const fetchConfAction = createAsyncThunk<Conf[], void, { state: State }>(`${SLICE_NAME}/fetchConf`, () => {
  return getConfRequest()
});



const confSlice = createSlice({
  name: SLICE_NAME,


  initialState: {
    conf: APP_DEFAULT_CONF,
    loading: false,
  },


  reducers: {
    updateConf: (state, { payload }) => {
      state.conf = payload;
    },
  },


  extraReducers: (builder) => {
    builder
      .addCase(fetchConfAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConfAction.fulfilled, (state, { payload }) => {
        state.conf = payload;
        state.loading = false;
      })
      .addCase(fetchConfAction.rejected, (state) => {
        state.loading = false;
      });
  },
});


const persistConfig = getPersistConf({ key: 'conf' })
export const persistConfReducer = persistReducer(persistConfig, confSlice.reducer)

export default confSlice;
