// import { persistReducer } from 'redux-persist';
// import { REHYDRATE } from 'redux-persist/es/constants';
// import storage from 'redux-persist/lib/storage';
// import { EAppActionTypes } from '../constants/enums';
// import { Tasklist } from '../models/Task';


// const getDefaultUserConf = (): IUserConf => ({
//   dateFormat: 'YYYY/MM/DD',
//   timeFormat: 'HH:mm:ss',
//   defalutTasklist: null,
//   rememberLastUeseTasklist: true,
//   reportError: false,
// })


// export const initialState: IAppStatus = {
//   // account
//   account: null,
//   token: null,
//   loggingIn: false,
//   scopes: ['User.Read', 'Tasks.ReadWrite'],

//   // tasklist
//   tasklists: [],
//   selectedTasklist: null,
//   fetchingTasklists: false,

//   //task
//   popupForm: null,
//   creatingTask: false,

//   // conf
//   appConf: {},
//   userConf: getDefaultUserConf(),

//   // debug
//   error: null,
//   log: []
// };


// // TODO
// function appReducer(state = initialState, action: any): IAppStatus {
//   switch (action.type) {
//     // Account
//     case EAppActionTypes.GET_ACCOUNTS: {
//       const account = action.payload;
//       return { ...state, account };
//     }

//     // Fetch token
//     case EAppActionTypes.FETCH_OAUTH_TOKEN_START: {
//       return { ...state, loggingIn: true };
//     }
//     case EAppActionTypes.FETCH_OAUTH_TOKEN_SUCCESS: {
//       const token = action.payload;
//       return {
//         ...state, token, loggingIn: false,
//       };
//     }

//     // logout、fetch token error
//     case EAppActionTypes.LOG_OUT_START:
//     case EAppActionTypes.LOG_OUT_ERROR:
//     case EAppActionTypes.LOG_OUT_SUCCESS:
//     case EAppActionTypes.FETCH_OAUTH_TOKEN_ERROR:
//       return {
//         ...state, account: null, token: null, loggingIn: false,
//       };

//     // https://github.com/rt2zz/redux-persist/issues/577
//     case REHYDRATE: {
//       if (action.key === 'tasklist' && action.payload && Array.isArray(action.payload.tasklists)) {
//         const tasklists = action.payload.tasklists.map((x: ITasklistProperty) => new Tasklist(x));
//         return {
//           ...state, ...action.payload, tasklists,
//         };
//       }
//       return state;
//     }

//     // Task list
//     case EAppActionTypes.FETCH_TASKLIST_LIST_START: {
//       return { ...state, fetchingTasklists: true };
//     }
//     case EAppActionTypes.FETCH_TASKLIST_LIST_SUCCESS: {
//       const tasklists = action.payload;
//       return {
//         ...state, tasklists, fetchingTasklists: false,
//       };
//     }
//     case EAppActionTypes.FETCH_TASKLIST_LIST_ERROR: {
//       const error = action.payload;
//       return { ...state, error, fetchingTasklists: false };
//     }

//     default:
//       return state;
//   }
// }

// export default persistReducer({ key: 'app', storage, whitelist: ['token'] }, appReducer);
