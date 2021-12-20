import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICreateTaskParams, IPopupForm, ITasklistResult } from "../../types";
import { DEFAULT_FORM_VALS } from "../constants";
import { bindAsyncActions } from "../helpers";
import request from "../helpers/request";

/**
 * 创建任务
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTask = createAsyncThunk<
  ITasklistResult,
  { tasklisId: string; task: ICreateTaskParams }
>("task/createTask", ({ tasklisId, task }, { rejectWithValue }) =>
  request
    .post<any, ITasklistResult>(`me/todo/lists/${tasklisId}/tasks`, task)
    .catch((e) => {
      rejectWithValue(e.serializ());
      return Promise.reject(e);
    })
);



export const popupSlice = createSlice({
  name: "popup",

  initialState: {
    form: DEFAULT_FORM_VALS,
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
      })
      .addCase(createTask.rejected, (state, { payload }) => {
        state.creating = false;
      });
  },
});

export const asyncChunk = {
  createTask,
};
bindAsyncActions(popupSlice, asyncChunk);

export default popupSlice;
