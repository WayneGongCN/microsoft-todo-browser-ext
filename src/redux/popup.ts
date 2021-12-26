import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_FORM_VALS } from "../constants";
import { createTask } from "./task";

export const popupSlice = createSlice({
  name: "popup",

  initialState: {
    form: { ...DEFAULT_FORM_VALS },
    creating: false,
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
        state.form = { ...DEFAULT_FORM_VALS };
      })
      .addCase(createTask.rejected, (state, { payload }) => {
        state.creating = false;
      });
  },
});

export default popupSlice;
