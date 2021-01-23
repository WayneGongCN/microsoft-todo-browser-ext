import msalInstance from '../helpers/msal';
import { Task, Tasklist } from '../models/Task';
import getStore from '../reducers';

window.getStore = getStore;
window.msalInstance = msalInstance;
window.Task = Task;
window.Tasklist = Tasklist;
