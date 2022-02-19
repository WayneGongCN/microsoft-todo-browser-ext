import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { State } from '.';
import { HOME_URL } from '../constants';

const SLICE_NAME = 'conf';
const APP_DEFAULT_CONF = {
  sentryDsn: 'https://365de3b2d6514a4caca2e06294ff74d0@o1093323.ingest.sentry.io/6112552',
  reportSampleRate: 0.1,
  gtmID: 'GTM-WVNS69V',
  gtmEvn: '',
};

export const fetchConf = createAsyncThunk<typeof APP_DEFAULT_CONF, void, { state: State }>(`${SLICE_NAME}/fetchConf`, () => {
  return axios.request({ baseURL: HOME_URL, url: '/api/v1/conf.json' }).then((res) => res.data);
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
      .addCase(fetchConf.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConf.fulfilled, (state, { payload }) => {
        state.conf = payload;
        state.loading = false;
      })
      .addCase(fetchConf.rejected, (state) => {
        state.loading = false;
      });
  },
});


export default confSlice;
