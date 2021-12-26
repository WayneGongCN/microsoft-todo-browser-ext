import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICreateTaskParams, IPopupForm, ITaskResult } from "../../types";
import { ETaskContentTypes, ETaskImportance, NotifyType, TimeZone } from "../constants/enums";
import { bindAsyncActions, openMicrosoftTodo } from "../helpers";
import Notify from "../helpers/notification";
import request from "../helpers/request";

const mapToTaskParams = (popupForm: IPopupForm): ICreateTaskParams => {
  const { title, describe, bookmarked, importance, dateTime } = popupForm;
  const bookmarkedContent = bookmarked ? `${bookmarked}` : "";
  const content = `${describe}\n\n${bookmarkedContent}`;

  const result: ICreateTaskParams = {
    title,
    body: {
      content,
      contentType: ETaskContentTypes.TEXT,
    },
    importance: importance ? ETaskImportance.HIGH : ETaskImportance.NORMAL,
  };

  if (dateTime) {
    result.reminderDateTime = {
      timeZone: TimeZone.UTC,
      dateTime: dateTime,
    };
  }
  return result;
};

/**
 * 创建任务
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTask = createAsyncThunk<ITaskResult, IPopupForm>("task/createTask", (params, { rejectWithValue }) => {
  const { tasklistId, ...taskMeta } = params;
  return request
    .post<any, ITaskResult>(`me/todo/lists/${tasklistId}/tasks`, mapToTaskParams(taskMeta))
    .then((res) => {
      new Notify({
        title: "Add a task success",
        message: "Open task on Microsoft To-Do.",
      })
        .onClick(() => openMicrosoftTodo(NotifyType.TASK, res.id))
        .show();
      return res;
    })
    .catch((e) => {
      rejectWithValue(e.serializ());
      return Promise.reject(e);
    });
});

export const taskSlice = createSlice({
  name: "task",

  initialState: {
    tasks: {} as Record<string, ITaskResult[]>,
    creating: false,
    error: null,
  },

  reducers: {},

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
bindAsyncActions(taskSlice, asyncChunk);

export default taskSlice;
