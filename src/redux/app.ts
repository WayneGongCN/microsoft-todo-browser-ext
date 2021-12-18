import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from ".";
import { authentication as msalAuthentication } from "../helpers/msal";
import request from "../helpers/request";
import { AuthenticationResult } from "@azure/msal-browser";
import { ICreateTaskParams, ITasklistResult } from "../types";


type SerializableAuthenticationResult = Omit<
  AuthenticationResult,
  "expiresOn"
> & { expiresOn: string };
export const authentication =
  createAsyncThunk<SerializableAuthenticationResult>(
    "app/authenticationResult",
    (_, { getState }) => {
      const state = getState() as State;
      const scopes = state.app.scopes;
      return msalAuthentication({ scopes }).then((res) =>
        JSON.parse(JSON.stringify(res))
      );
    }
  );


export const getTasklist = createAsyncThunk<ITasklistResult>(
  "app/getTasklist",
  (_, { getState }) => {
    const state = getState() as State;
    const headers = {
      Authorization: `Bearer ${state.app.authenticationResult.accessToken}`,
    };
    return request
      .get<ITasklistResult>("me/todo/lists", { headers })
      .then((res) => res.data);
  }
);

/**
 * Create task
 *
 * https://github.com/microsoftgraph/microsoft-graph-docs/blob/master/api-reference/v1.0/api/todotasklist-post-tasks.md
 */
export const createTask = createAsyncThunk<
  ITasklistResult,
  { tasklisId: string; task: ICreateTaskParams }
>("app/createTask", (params, { getState }) => {
  const state = getState() as State;
  const headers = {
    Authorization: `Bearer ${state.app.authenticationResult.accessToken}`,
  };
  return request
    .post(`me/todo/lists/${params.tasklisId}/tasks`, params.task, {
      headers,
    })
    .then((res) => res.data);
});

export const appSlice = createSlice({
  name: "app",

  initialState: {
    authenticationResult: null as null | SerializableAuthenticationResult,
    scopes: ["profile", "Tasks.ReadWrite"],
    tasklist: [] as ITasklistResult["value"],
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(authentication.fulfilled, (state, action) => {
        state.authenticationResult = action.payload;
      })
      .addCase(getTasklist.fulfilled, (state, action) => {
        state.tasklist = action.payload.value;
      });
  },
});

export const asyncChunk = {
  authentication,
  getTasklist,
  createTask,
};
// @ts-ignore
appSlice.authentication = authentication;
// @ts-ignore
appSlice.getTasklist = getTasklist;
// @ts-ignore
appSlice.createTask = createTask;

export default appSlice;
