/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import * as popupActions from '../actions/popup';
import * as appActions from '../actions/app';
import * as tasklistActions from '../actions/tasklist';

import PopupTaskForm from '../components/PopupTaskForm';
// import Message from '../components/Message';
import Login from '../components/Login';
import { openMicrosoftTodo } from '../helpers';

class PopupContainer extends Component {
  constructor(props) {
    super(props);

    this.login = this.login.bind(this);
  }

  componentDidMount() {
    const { actions: { getAccount } } = this.props;
    getAccount();
  }

  componentDidUpdate() {
    const {
      app,
      tasklist,
      popup,
      actions: { fetchTasklistList, editTasklist },
    } = this.props;

    if (app.account && !tasklist.updateByNetwork && !tasklist.fetchingTasklistList && !tasklist.error) {
      fetchTasklistList();
    }

    if (!popup.tasklistId && tasklist.tasklistList.length) {
      editTasklist(tasklist.tasklistList[0].id);
    }
  }

  login() {
    const { actions: { getOAuthToken, getAccount } } = this.props;
    getOAuthToken().then(getAccount);
  }

  render() {
    const {
      props: {
        app,
        tasklist,
        popup,

        actions: {
          editTitle,
          editDescribe,
          editReminderDateTime,
          editTasklist,
          editBookmarked,
          editImportance,
          createTask,
          resetPopupform,
        },
      },
      login,
    } = this;

    return (
      <>
        <Grid container direction="row-reverse">
          <Grid item>
            <Link component="button" onClick={openMicrosoftTodo}>
              Microsoft To-Do
            </Link>
          </Grid>
        </Grid>

        {
          app.account
            ? (
              <PopupTaskForm
                form={popup}
                taskCreating={app.taskCreating}
                tasklistList={tasklist.tasklistList}
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
const mapActionToProps = (dispatch) => ({ actions: bindActionCreators({ ...popupActions, ...tasklistActions, ...appActions }, dispatch) });
export default connect(mapStateToProps, mapActionToProps)(PopupContainer);
