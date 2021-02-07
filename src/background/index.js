/* eslint-disable import/first */
/* eslint-disable import/newline-after-import */
import msalInstance from '../helpers/msal';
window.msalInstance = msalInstance;

import { Task, Tasklist } from '../models/Task';
window.Task = Task;
window.Tasklist = Tasklist;

import getStore from '../reducers';
window.getStore = getStore;
