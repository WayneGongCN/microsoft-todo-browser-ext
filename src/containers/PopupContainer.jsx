/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import * as popupActions from '../actions/popup';
import * as accountActions from '../actions/account';

import PopupTaskForm, { popupTaskFormPropTypes } from '../components/PopupTaskForm';
import Message, { messagePropTypes } from '../components/Message';
import Login from '../components/Login';

function toMsTodo() {
  chrome.tabs.create({ active: true, url: 'https://to-do.live.com/tasks/inbox' });
}

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
    const { getAccount } = this.props;
    getAccount();
  }

  componentDidUpdate() {
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
        <Grid container direction="row-reverse">
          <Grid item>
            <Link component="button" onClick={toMsTodo}>
              Microsoft To-Do
            </Link>
          </Grid>
        </Grid>

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

PopupContainer.propTypes = {
  ...popupTaskFormPropTypes,
  ...messagePropTypes,
};

const mapStateToProps = (state) => ({ ...state.popup, ...state.account });
const mapActionToProps = (dispatch) => bindActionCreators({ ...popupActions, ...accountActions }, dispatch);
export default connect(mapStateToProps, mapActionToProps)(PopupContainer);
