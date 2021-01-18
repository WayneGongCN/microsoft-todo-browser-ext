/* eslint-disable import/no-unresolved */
import msalInstance from '../helpers/msal';
import Task from '../models/Task';
import Tasklist from '../models/Tasklist';
import store from '../reducers';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Installed.');
});

window.msalInstance = msalInstance;
window.Task = Task;
window.Tasklist = Tasklist;
window.store = store;

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  console.log('Background onMessage', msg, sender, sendRes);
});
