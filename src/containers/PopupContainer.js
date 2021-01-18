/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/jsx-props-no-spreading */
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Popup from '../components/Popup';
import {
  editTitle,
  editBody,
  editTasklist,
  editReminderDate,
  editBookmarks,
  editImportance,
  resetTask,
  createTask,
  fetchTasklistList,
} from '../actions/popup';

class PopupContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.fetchTasklistList();
  }

  render() {
    return <Popup {...this.props} />;
  }
}

const mapStateToProps = (state) => ({ ...state.popup });
const mapDispatchToProps = {
  editTitle,
  editBody,
  editTasklist,
  editReminderDate,
  editBookmarks,
  editImportance,
  resetTask,
  createTask,
  fetchTasklistList,
};

export default connect(mapStateToProps, mapDispatchToProps)(PopupContainer);
