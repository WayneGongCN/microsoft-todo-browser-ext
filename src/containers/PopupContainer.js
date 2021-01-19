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

  // shouldComponentUpdate() {
  //   // can submit
  // }

  editTaskTitle(e) {
    const { task, actions } = this.props;
    actions.editTask({ ...task, title: e.target.value });
  }

  editTaskDescribe(e) {
    const { task, actions } = this.props;
    const newTask = { ...task };
    newTask.body.content = e.target.value;
    actions.editTask(newTask);
  }

  editReminderDateTime(e) {
    const { task, actions } = this.props;
    const newTask = { ...task };
    newTask.reminderDateTime.dateTime = e.target.value;
    actions.editTask(newTask);
  }

  editSelectedTasklist(e) {
    const { actions } = this.props;
    actions.editSelectedTasklist(e.target.value);
  }

  editImportance(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { task, actions } = this.props;
    let { importance } = this.props;
    importance = !importance;
    importance = importance ? 'high' : 'normal';
    actions.editTask({ ...task, importance });
  }

  editBookmarked(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { bookmarked, actions } = this.props;
    actions.editBookmarked(!bookmarked);
  }

  createTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const {
      props: {
        task, bookmarked, selectedTasklistId, actions,
      },
    } = this;

    const newTask = { ...task };
    if (bookmarked) {
      newTask.body.content += '\nPageInfo';
    }
    newTask.test = '123';
    actions.createTask(selectedTasklistId, newTask).then(actions.resetTask);
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

        importance,
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
          importance={importance}
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
  (state) => ({
    ...state.popup,
    importance: state.popup.task.importance === 'high',
  }),
  (dispatch) => ({ actions: bindActionCreators(popupActions, dispatch) }),
)(PopupContainer);
