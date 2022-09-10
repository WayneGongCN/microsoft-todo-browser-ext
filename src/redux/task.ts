import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CreateTaskParams, createTaskRequest, CreateTaskResult, ETaskContentTypes, ETaskImportance } from '../api/createTask';
import { PopupForm, TIME_ZONE } from '../constants';
import { NotifyType } from '../constants/enums';
import { LNAG_ADD_TASK, LNAG_OPEN_MS_TODO, LNAG_SUCCESS } from '../constants/lang';
import { getActiveTab, openMicrosoftTodo } from '../helpers';
import Notify from '../helpers/notification';



export const mapToTaskParams = async (popupForm: PopupForm, tab?: chrome.tabs.Tab): Promise<CreateTaskParams> => {
  const { title, describe, bookmark, importance, dateTime } = popupForm;

  let bookmarkContent = '';
  if (bookmark) {
    const activeTba = tab || (await getActiveTab());
    bookmarkContent = `\n---\n${activeTba.title}\n${activeTba.url}`;
  }

  const content = `${describe}\n${bookmarkContent}`;
  const result: CreateTaskParams = {
    title,
    body: {
      content,
      contentType: ETaskContentTypes.TEXT,
    },
    importance: importance ? ETaskImportance.HIGH : ETaskImportance.NORMAL,
  };

  if (dateTime) {
    result.reminderDateTime = {
      timeZone: TIME_ZONE,
      dateTime: dateTime,
    };
  }
  return result;
};



/**
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/main/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTaskAction = createAsyncThunk<CreateTaskResult, PopupForm>('task/createTask', async (params, { rejectWithValue }) => {
  const { tasklistId } = params;
  const data = await mapToTaskParams(params);
  return createTaskRequest(tasklistId, data).then((res) => {
    new Notify({
      title: `${LNAG_ADD_TASK}${LNAG_SUCCESS}`,
      message: LNAG_OPEN_MS_TODO,
    })
      .onClick(() => openMicrosoftTodo(NotifyType.TASK, res.id))
      .show();
    return res;
  })
    .catch((e) => {
      rejectWithValue(e?.serializ());
      return Promise.reject(e);
    });
});



const taskSlice = createSlice({
  name: 'task',

  initialState: {
    tasks: {} as Record<string, CreateTaskResult[]>,
    creating: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // createTask
      .addCase(createTaskAction.pending, (state) => {
        state.creating = true;
      })
      .addCase(createTaskAction.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createTaskAction.rejected, (state) => {
        state.creating = false;
      });
  },
});


export default taskSlice;
