import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { State } from '.';
import { DEFAULT_FORM_POPUP } from '../constants';
import { getPersistConf, MessageType, sendMessageToActiveTab } from '../helpers';
import { FillMode } from './options';
import { createTaskAction } from './task';



const SLICE_NAME = 'popup'


export const updateTasklistIdAction = createAsyncThunk<string, void, { state: State }>(`${SLICE_NAME}/updateTasklistId`, async (_, { getState }) => {
  const { options, popup, tasklist } = getState()
  const { enableKeepLastTasklist, defaultTasklistId } = options.form
  return enableKeepLastTasklist ? popup.lastTasklistId || tasklist.lists[0]?.id || '' : (defaultTasklistId || popup.form.tasklistId)
})



export const autoFillAction = createAsyncThunk<{ content: string; fillMode: FillMode } | null, void, { state: State }>(`${SLICE_NAME}/autoFill`, async (_, { getState, dispatch }) => {
  const { options, popup } = getState()
  const { enableAutoFill, enableForceFill, fillMode } = options.form
  if (enableAutoFill) {
    if (enableForceFill || !popup.isDirty) {
      const content = await sendMessageToActiveTab<string>({ type: MessageType.GET_SELECTION_TEXT })
      if (content) return { content, fillMode }
    }
  }

  return null
})



export const initialFormDataAction = createAsyncThunk<any, void, { state: State }>(`${SLICE_NAME}/initialFormData`, async (_, { getState, dispatch }) => {
  const { options } = getState()
  if (options.form.enableForceFill) dispatch(popupSlice.actions.setDirty(false))
  return Promise.all([
    dispatch(autoFillAction()),
    dispatch(updateTasklistIdAction())
  ])
})



export const resetFormDataAction = createAsyncThunk(`${SLICE_NAME}/resetFormData`, async (_, { getState, dispatch }) => {
  return Promise.all([
    dispatch(popupSlice.actions.resetForm()),
    dispatch(updateTasklistIdAction())
  ])
})


const popupSlice = createSlice({
  name: 'popup',

  initialState: {
    form: { ...DEFAULT_FORM_POPUP },
    lastTasklistId: '',
    isDirty: false,
    loading: false,
    error: null,
  },


  reducers: {
    updateForm: (state, { payload }) => {
      state.form = { ...state.form, ...payload };
      state.lastTasklistId = payload.tasklistId;
    },

    resetForm: (state) => {
      state.form = { ...DEFAULT_FORM_POPUP };
      state.isDirty = false
    },

    setDirty: (state, { payload }) => {
      state.isDirty = payload
    }
  },


  extraReducers: (builder) => {
    builder
      /**
       * createTask
       */
      .addCase(createTaskAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTaskAction.fulfilled, (state) => {
        state.loading = false;
        state.form = { ...DEFAULT_FORM_POPUP, tasklistId: state.form.tasklistId };
      })
      .addCase(createTaskAction.rejected, (state) => {
        state.loading = false;
      })


      /**
       * updateTasklistIdAction
       */
      .addCase(updateTasklistIdAction.fulfilled, (state, { payload }) => {
        state.form.tasklistId = payload
      })


      /**
       * autoFillAction
       */
      .addCase(autoFillAction.fulfilled, (state, { payload }) => {
        if (!payload) return
        const { content, fillMode } = payload
        state.form[fillMode] = content
      })
  },
});




const persistConfig = getPersistConf({ key: 'popup', whitelist: ['form', 'lastTasklistId', 'isDirty'] })
export const persistPopupReducer = persistReducer(persistConfig, popupSlice.reducer)

export default popupSlice;
