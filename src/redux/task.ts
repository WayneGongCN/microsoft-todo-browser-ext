import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICreateTaskParams, IPopupForm, ITasklistResult, ITasksResult } from "../../types";
import { ETaskContentTypes, ETaskImportance, TimeZone } from "../constants/enums";
import { bindAsyncActions } from "../helpers";
import request from "../helpers/request";


const mapToTaskParams = (popupForm: IPopupForm): ICreateTaskParams => {
  const {title, describe, bookmarked, importance, dateTime} = popupForm
  const bookmarkedContent = bookmarked ? `${bookmarked}` : ''
  const content = `${describe}\n\n${bookmarkedContent}`;
  return {
    title,
    body: {
      content,
      contentType: ETaskContentTypes.TEXT,
    },
    importance: importance ? ETaskImportance.HIGH : ETaskImportance.NORMAL,
    reminderDateTime: {
      timeZone: TimeZone.UTC,
      dateTime: dateTime
    }
  }
}


/**
 * 创建任务
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTask = createAsyncThunk<
  ITasklistResult,
  IPopupForm
>("task/createTask", (params, { rejectWithValue }) =>{
  const { tasklistId, ...taskMeta } = params
  return request
    .post<any, ITasklistResult>(`me/todo/lists/${tasklistId}/tasks`, mapToTaskParams(taskMeta))
    .catch((e) => {
      rejectWithValue(e.serializ());
      return Promise.reject(e);
    })
}
);


export const taskSlice = createSlice({
  name: "task",

  initialState: {
    tasks: [] as ITasksResult["value"] & { tasklistId: string },
    creating: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // createTask
      .addCase(createTask.pending, (state) => {
        state.creating = true;
      })
      .addCase(
        createTask.fulfilled,
        (state, { payload, meta }) => {
          state.creating = false;
        }
      )
      .addCase(createTask.rejected, (state, { payload }) => {
        state.creating = false;
      })

  },
});


export const asyncChunk = {
  createTask,
};
bindAsyncActions(taskSlice, asyncChunk);


export default taskSlice;
