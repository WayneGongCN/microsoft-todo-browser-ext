/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-props-no-spreading */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PopupTaskForm from '../components/PopupTaskForm';
import * as popupActions from '../actions/popup';
import * as accountActions from '../actions/account';
import Message from '../components/Message';
import MicrosoftTodoLink from '../components/MicrosoftTodoLink';
import Login from '../components/Login';

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
    console.log('componentDidMount');
    const { getAccount } = this.props;
    getAccount();
  }

  componentDidUpdate(prevProps) {
    console.log('componentDidUpdate', prevProps);
    const {
      account, tasklistList, fetchTasklistList, tasklistListLoading,
    } = this.props;

    if (account && tasklistList.length === 0 && !tasklistListLoading) {
      fetchTasklistList();
    }
  }

  editTaskTitle(e) {
    const { editTaskTitle } = this.props;
    editTaskTitle(e.target.value);
  }

  editTaskDescribe(e) {
    const { editTaskDescribe } = this.props;
    editTaskDescribe(e.target.value);
  }

  editReminderDateTime(e) {
    const { editReminderDateTime } = this.props;
    editReminderDateTime(e.target.value);
  }

  editSelectedTasklist(e) {
    const { editSelectedTasklist } = this.props;
    editSelectedTasklist(e.target.value);
  }

  editImportance(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { editImportance } = this.props;
    editImportance(e.target.checked);
  }

  editBookmarked(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { editBookmarked } = this.props;
    editBookmarked(e.target.checked);
  }

  createTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const {
      selectedTasklistId, task, bookmarked, createBookmarkedTask, createTask,
    } = this.props;
    if (bookmarked) {
      createBookmarkedTask(selectedTasklistId, task);
    } else {
      createTask(selectedTasklistId, task);
    }
  }

  resetTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { resetTask } = this.props;
    resetTask();
  }

  render() {
    const {
      props: {
        account,

        task,
        tasklistList,
        selectedTasklistId,
        taskCreating,
        tasklistListLoading,
        bookmarked,

        opemMessage,
        messageType,
        message,

        closeMessage,
        getOAuthToken,
        loggingIn,
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
      <>
        <MicrosoftTodoLink />

        {
          account
            ? (
              <PopupTaskForm
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
            )
            : <Login login={() => getOAuthToken()} loading={loggingIn} />
        }

        <Message
          opemMessage={opemMessage}
          closeMessage={closeMessage}
          messageType={messageType}
          message={message}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({ ...state.popup, ...state.account });

const mapActionToProps = (dispatch) => bindActionCreators({ ...popupActions, ...accountActions }, dispatch);

export default connect(mapStateToProps, mapActionToProps)(PopupContainer);
