import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_FORM_VALS } from '../constants';
import { createTask } from './task';
import { getTasklist } from './tasklist';

export const popupSlice = createSlice({
  name: 'popup',

  initialState: {
    form: { ...DEFAULT_FORM_VALS },
    creating: false,
    loadingTasklist: false,
    error: null,
  },

  reducers: {
    updateForm: (state, { payload }) => {
      state.form = { ...payload };
    },

    /**
     * 重置表单，tasklist 保持上次选中的内容
     */
    resetForm: (state) => {
      state.form = { ...DEFAULT_FORM_VALS, tasklistId: state.form.tasklistId };
    },
  },

  extraReducers: (builder) => {
    builder
      // createTask
      .addCase(createTask.pending, (state) => {
        state.creating = true;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.creating = false;
        state.form = { ...DEFAULT_FORM_VALS, tasklistId: state.form.tasklistId };
      })
      .addCase(createTask.rejected, (state) => {
        state.creating = false;
      })

      // getTasklist
      .addCase(getTasklist.pending, (state) => {
        state.loadingTasklist = true;
      })
      .addCase(getTasklist.fulfilled, (state, { payload }) => {
        state.loadingTasklist = false;
        if (!state.form.tasklistId) {
          const firstTasklist = payload.value[0];
          state.form.tasklistId = firstTasklist.id;
        }
      })
      .addCase(getTasklist.rejected, (state) => {
        state.loadingTasklist = false;
      });
  },
});

export default popupSlice;
