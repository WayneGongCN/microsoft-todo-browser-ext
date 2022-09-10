import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_FORM_POPUP } from '../constants';
import { createTaskAction } from './task';
import { fetchTasklistAction } from './tasklist';



const popupSlice = createSlice({
  name: 'popup',

  initialState: {
    form: { ...DEFAULT_FORM_POPUP },
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
      state.form = { ...DEFAULT_FORM_POPUP, tasklistId: state.form.tasklistId };
    },
  },

  extraReducers: (builder) => {
    builder
      // createTask
      .addCase(createTaskAction.pending, (state) => {
        state.creating = true;
      })
      .addCase(createTaskAction.fulfilled, (state) => {
        state.creating = false;
        state.form = { ...DEFAULT_FORM_POPUP, tasklistId: state.form.tasklistId };
      })
      .addCase(createTaskAction.rejected, (state) => {
        state.creating = false;
      })

      // fetchTasklist
      .addCase(fetchTasklistAction.pending, (state) => {
        state.loadingTasklist = true;
      })
      .addCase(fetchTasklistAction.fulfilled, (state, { payload }) => {
        state.loadingTasklist = false;
        if (!state.form.tasklistId) {
          const firstTasklist = payload.value[0];
          state.form.tasklistId = firstTasklist.id;
        }
      })
      .addCase(fetchTasklistAction.rejected, (state) => {
        state.loadingTasklist = false;
      });
  },
});

export default popupSlice;
