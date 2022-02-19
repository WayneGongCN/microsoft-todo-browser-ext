import { createSlice } from '@reduxjs/toolkit';
import { APP_DEFAULT_OPTIONS } from '../constants';
import { initQuickAdd } from '../helpers/quickAdd';
import { fetchTasklist } from './tasklist';

const optionsSlice = createSlice({
  name: 'options',

  initialState: {
    form: { ...APP_DEFAULT_OPTIONS },
    error: null,
  },

  reducers: {
    updateForm: (state, { payload }) => {
      if (payload.enableQuickAdd !== state.form.enableQuickAdd) setTimeout(initQuickAdd);
      state.form = { ...state.form, ...payload };
    },

    /**
     * 重置表单，tasklist 保持上次选中的内容
     */
    resetForm: (state) => {
      state.form = { ...APP_DEFAULT_OPTIONS };
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchTasklist.fulfilled, (state, { payload }) => {
      if (!state.form.quickAddTaskTasklistId && Array.isArray(payload.value) && payload.value.length) {
        const firstTasklist = payload.value[0];
        state.form.quickAddTaskTasklistId = firstTasklist.id;
      }
    });
  },
});

export default optionsSlice;
