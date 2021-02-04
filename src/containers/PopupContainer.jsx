/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import * as popupActions from '../actions/popup';
import * as appActions from '../actions/app';

import PopupTaskForm from '../components/PopupTaskForm';
// import Message from '../components/Message';
import Login from '../components/Login';

function toMsTodo() {
  chrome.tabs.create({ active: true, url: 'https://to-do.live.com/tasks/inbox' });
}

class PopupContainer extends Component {
  constructor(props) {
    super(props);

    this.editTitle = this.editTitle.bind(this);
    this.editDescribe = this.editDescribe.bind(this);
    this.editReminderDateTime = this.editReminderDateTime.bind(this);
    this.editTasklist = this.editTasklist.bind(this);
    this.editImportance = this.editImportance.bind(this);
    this.editBookmarked = this.editBookmarked.bind(this);
    this.createTask = this.createTask.bind(this);
    this.resetPopupform = this.resetPopupform.bind(this);
  }

  componentDidMount() {
    const { actions: { getAccount } } = this.props;
    getAccount();
  }

  componentDidUpdate() {
    const {
      app,
      actions: { fetchTasklistList },
    } = this.props;

    if (app.account && app.tasklistList.length === 0 && !app.fetchingTasklistList) {
      fetchTasklistList();
    }
  }

  editTitle(e) {
    const { actions: { editTitle } } = this.props;
    editTitle(e.target.value);
  }

  editDescribe(e) {
    const { actions: { editDescribe } } = this.props;
    editDescribe(e.target.value);
  }

  editReminderDateTime(e) {
    const { actions: { editReminderDateTime } } = this.props;
    editReminderDateTime(e.target.value);
  }

  editTasklist(e) {
    const { actions: { editTasklist } } = this.props;
    editTasklist(e.target.value);
  }

  editImportance(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions: { editImportance } } = this.props;
    editImportance(e.target.checked);
  }

  editBookmarked(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions: { editBookmarked } } = this.props;
    editBookmarked(e.target.checked);
  }

  createTask(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { popup, actions: { createTask } } = this.props;
    createTask(popup.tasklistId, popup);
  }

  resetPopupform(e) {
    if (e.type === 'keyup' && e.code !== 'Enter') return;
    const { actions: { resetPopupform } } = this.props;
    resetPopupform();
  }

  login() {
    const { actions: { getOAuthToken } } = this.props;
    getOAuthToken();
  }

  render() {
    const {
      props: {
        app,
        popup,
      },

      editTitle,
      editDescribe,
      editReminderDateTime,
      editTasklist,
      editBookmarked,
      editImportance,
      createTask,
      resetPopupform,
      login,
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
          app.account
            ? (
              <PopupTaskForm
                form={popup}
                tasklistList={app.tasklistList}
                taskCreating={app.taskCreating}
                fetchingTasklistList={app.fetchingTasklistList}
                editTitle={editTitle}
                editDescribe={editDescribe}
                editReminderDateTime={editReminderDateTime}
                editTasklist={editTasklist}
                editImportance={editImportance}
                editBookmarked={editBookmarked}
                resetPopupform={resetPopupform}
                createTask={createTask}
              />
            )
            : <Login login={login} loading={app.loggingIn} />
        }
      </>
    );
  }
}

const mapStateToProps = (state) => state;
const mapActionToProps = (dispatch) => ({ actions: bindActionCreators({ ...popupActions, ...appActions }, dispatch) });
export default connect(mapStateToProps, mapActionToProps)(PopupContainer);
