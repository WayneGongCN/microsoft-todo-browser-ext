import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { State } from '.';
import { getConfRequest } from '../api/getConf';
import { getPersistConf } from '../helpers';



const SLICE_NAME = 'conf';
const APP_DEFAULT_CONF = {
  sentryDsn: 'https://365de3b2d6514a4caca2e06294ff74d0@o1093323.ingest.sentry.io/6112552',
  reportSampleRate: 0.1,
  gtmID: 'GTM-WVNS69V',
  gtmEvn: '',
};



export const fetchConfAction = createAsyncThunk<typeof APP_DEFAULT_CONF, void, { state: State }>(`${SLICE_NAME}/fetchConf`, () => {
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
