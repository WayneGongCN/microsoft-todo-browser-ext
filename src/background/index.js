// import { createNewTask } from '../actions/todo';
// import msalInstance from '../helpers/msal';
import Task from '../models/Task';
import Tasklist from '../models/Tasklist';
import store from '../reducers';

chrome.runtime.onInstalled.addListener(() => {
  // console.log('Installed.');
  // console.log('msalInstance', msalInstance);
  // console.log('Tasklist: ', Tasklist);
  // console.log('Task: ', Task);
});

window.store = store;
window.Task = Task;
window.Tasklist = Tasklist;

// console.log('create task list');
// new Tasklist({ displayName: 'test task List' }).create()
//   .then((taskList) => {
//     console.log('Tasklist.create: ', taskList);
//     return taskList.listTasks()
//       .then((tasks) => {
//         console.log('Tasklist.listTasks: ', tasks);
//         return taskList;
//       });
//   })
//   .then((taskList) => {
//     console.log(taskList);
//     return taskList.createTask({ title: 'task1' });
//   })
//   .then((task) => {
//     console.log('Tasklist.createTask: ', task);
//     task.title += ' edit';
//     return task.update();
//   })
//   .then((task) => {
//     console.log('Task.update', task);
//     return task.delete();
//   })
//   .then(() => {
//     console.log('Task delete success');
//   });
