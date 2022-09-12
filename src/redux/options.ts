/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createSlice } from '@reduxjs/toolkit';
import { createMigrate, persistReducer } from 'redux-persist';
import { ENABLE_DEBUG } from '../constants';
import { getPersistConf } from '../helpers';


export enum FillMode {
  TITLE = 'title',
  DESC = 'describe'
}

const APP_DEFAULT_OPTIONS = {
  enableKeepLastTasklist: true,
  defaultTasklistId: '',

  enableAutoFill: true,
  enableForceFill: true,
  fillMode: FillMode.TITLE,

  enableResetPopupForm: true,
  enableNotifacation: true,
  formSize: 'small' as 'medium' | 'small'
};


const optionsSlice = createSlice({
  name: 'options',

  initialState: {
    form: { ...APP_DEFAULT_OPTIONS },
    error: null,
  },

  reducers: {
    updateForm: (state, { payload }) => {
      state.form = { ...state.form, ...payload };
    },

    resetForm: (state) => {
      state.form = { ...APP_DEFAULT_OPTIONS };
    },
  },
});



const migrations = {
  133: (state: any) => {
    return {
      ...state,
      form: {
        enableKeepLastTasklist: true,
        defaultTasklistId: state.quickAddTaskTasklistId ?? '',

        enableAutoFill: state.enableQuickAdd ?? true,
        enableForceFill: true,
        fillMode: FillMode.TITLE,

        enableResetPopupForm: state.autoResetPopup ?? true,
        enableNotifacation: true,
        formSize: 'small',
      }
    }
  }
}


const persistConfig = getPersistConf({
  key: 'options',
  migrate: createMigrate(migrations, { debug: ENABLE_DEBUG }),
})
export const persistOptionsReducer = persistReducer(persistConfig, optionsSlice.reducer)

export default optionsSlice