import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
const taskApi = createApi({
  reducerPath: "test",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://graph.microsoft.com/v1.0",

    prepareHeaders: (headers, { getState }) => {
      // const token = (getState() as State).app.authenticationResult.token;

      // If we have a token set in state, let's assume that we should be passing it.
        headers.set("authorization", `Bearer xxx`);

      return headers;
    },
  }),

  endpoints: (builder) => ({
    getTaskById: builder.query({
      query: ({ taskListId, taskId }) =>
        `/me/todo/lists/${taskListId}/tasks/${taskId}`,
    }),

    listTask: builder.query({
      query: (taskListId) => `me/todo/lists/${taskListId}/tasks`,
    }),

    createTask: builder.mutation({
      query: (taskListId, ...path) => ({
        url: `/todo/lists/${taskListId}/tasks`,
        method: "POST",
        body: path,
      }),
    }),

    listTaskList: builder.query({
      query: () => "/me/todo/lists",
    }),
  }),
});

export default taskApi;
