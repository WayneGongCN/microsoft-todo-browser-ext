/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-props-no-spreading */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import Popup from '../components/Popup';
import * as popupActions from '../actions/popup';

class PopupContainer extends Component {
  constructor(props) {
    super(props);

    this.editTaskTitle = this.editTaskTitle.bind(this);
    this.editTaskDescribe = this.editTaskDescribe.bind(this);
    this.editReminderDateTime = this.editReminderDateTime.bind(this);
    this.editSelectedTasklist = this.editSelectedTasklist.bind(this);
    this.editImportance = this.editImportance.bind(this);
    this.editBookmarked = this.editBookmarked.bind(this);
    this.createTask = this.createTask.bind(this);
    this.resetTask = this.resetTask.bind(this);
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchTasklistList();
  }

  editTaskTitle(e) {
    const { actions } = this.props;
    actions.editTaskTitle(e.target.value);
  }

  editTaskDescribe(e) {
    const { actions } = this.props;
    actions.editTaskDescribe(e.target.value);
  }

  editReminderDateTime(e) {
    const { actions } = this.props;
    actions.editReminderDateTime(e.target.value);
  }

  editSelectedTasklist(e) {
    const { actions } = this.props;
    actions.editSelectedTasklist(e.target.value);
  }

  editImportance(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions } = this.props;
    actions.editImportance(e.target.value);
  }

  editBookmarked(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions } = this.props;
    actions.editBookmarked(e.target.checked);
  }

  createTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const {
      task, bookmarked, selectedTasklistId, actions,
    } = this.props;

    new Promise((resolve, reject) => {
      try {
        if (bookmarked) {
          chrome.tabs.query({ active: true }, (tab) => {
            const curTab = tab[0] || null;
            if (!curTab) resolve(null);
            const bookmarkInfo = `\n\n---\n${curTab.title}\n${curTab.url}`;
            resolve(bookmarkInfo);
          });
        } else {
          resolve(null);
        }
      } catch (e) {
        reject(e);
      }
    })
      .then((bookmarkInfo) => actions.createTask(selectedTasklistId, task, bookmarkInfo))
      .then(actions.resetTask);
  }

  resetTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions } = this.props;
    actions.resetTask();
  }

  render() {
    const {
      props: {
        task,
        tasklistList,
        selectedTasklistId,
        taskCreating,
        tasklistListLoading,
        bookmarked,
      },

      editTaskTitle,
      editTaskDescribe,
      editReminderDateTime,
      editSelectedTasklist,
      editBookmarked,
      editImportance,
      createTask,
      resetTask,
    } = this;

    return (
      <div>
        <Popup
          task={task}
          tasklistList={tasklistList}
          selectedTasklistId={selectedTasklistId}
          bookmarked={bookmarked}
          taskCreating={taskCreating}
          tasklistListLoading={tasklistListLoading}
          editTaskTitle={editTaskTitle}
          editTaskDescribe={editTaskDescribe}
          editReminderDateTime={editReminderDateTime}
          editSelectedTasklist={editSelectedTasklist}
          editBookmarked={editBookmarked}
          editImportance={editImportance}
          resetTask={resetTask}
          createTask={createTask}
        />
      </div>
    );
  }
}

export default connect(
  (state) => state.popup,
  (dispatch) => ({ actions: bindActionCreators(popupActions, dispatch) }),
)(PopupContainer);
