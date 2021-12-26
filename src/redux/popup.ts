import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_FORM_VALS } from "../constants";
import { createTask } from "./task";
import { getTasklist } from "./tasklist";

export const popupSlice = createSlice({
  name: "popup",

  initialState: {
    form: { ...DEFAULT_FORM_VALS },
    creating: false,
    loadingTasklist: false,
    error: null,
  },

  reducers: {
    updateForm: (state, { payload }) => {
      state.form = payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // createTask
      .addCase(createTask.pending, (state) => {
        state.creating = true;
      })
      .addCase(createTask.fulfilled, (state, { payload, meta }) => {
        state.creating = false;
        state.form = { ...DEFAULT_FORM_VALS, tasklistId: state.form.tasklistId };
      })
      .addCase(createTask.rejected, (state, { payload }) => {
        state.creating = false;
      })

      // getTasklist
      .addCase(getTasklist.pending, (state) => {
        state.loadingTasklist = true;
      })
      .addCase(getTasklist.fulfilled, (state, { payload, meta }) => {
        state.loadingTasklist = false;
        const firstTasklist = payload.value[0];
        if (firstTasklist) {
          state.form.tasklistId = firstTasklist.id;
        }
      })
      .addCase(getTasklist.rejected, (state, { payload }) => {
        state.loadingTasklist = false;
      })
  },
});

export default popupSlice;
