/* eslint-disable import/no-unresolved */
import msalInstance from '../helpers/msal';
import { Task, Tasklist } from '../models/Task';
import getStore from '../reducers';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Installed.');
});

window.getStore = getStore;
window.msalInstance = msalInstance;
window.Task = Task;
window.Tasklist = Tasklist;

console.log('msalInstance', msalInstance);
console.log('Task', Task);
console.log('Tasklist', Tasklist);
// console.log('store', store);

chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
  console.log('Background onMessage', msg, sender, sendRes);
});
