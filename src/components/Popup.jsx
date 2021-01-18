import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Add from '@material-ui/icons/Add';
import BookmarksOutlined from '@material-ui/icons/BookmarksOutlined';
import Star from '@material-ui/icons/Star';
import StarOutline from '@material-ui/icons/StarOutline';
import Bookmarks from '@material-ui/icons/Bookmarks';
import Fab from '@material-ui/core/Fab';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import Tasklist from '../models/Tasklist';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 80,
  },

  msColor: {
    color: '#346fef',
  },

  popupPage: {
    width: 400,
    height: 300,
  },
}));

function Popup(props) {
  const {
    taskCreating,
    tasklistListLoading,
    selectedBookmarks,

    tasklistList,
    selectedTasklist,

    task,
    editTitle,
    editBody,
    editTasklist,
    editReminderDate,
    editBookmarks,
    editImportance,
    resetTask,
    createTask,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.popupPage}>
      <TextField id="outlined-basic" label="Title" onChange={(e) => editTitle(e.target.value)} disabled={taskCreating} />
      <TextField id="outlined-basic" label="Describe" onChange={(e) => editBody(e.target.value)} disabled={taskCreating} />

      <FormControl className={classes.formControl}>
        <InputLabel id="task-list-label">Task List</InputLabel>
        <Select
          labelId="task-list"
          id="task-list-select"
          value={selectedTasklist}
          onChange={(e) => editTasklist(e.target.value)}
          disabled={taskCreating || tasklistListLoading}
        >
          {tasklistList.map((x) => <MenuItem key={x.id} value={x}>{x.displayName}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField
        id="date"
        label="Reminder Date"
        type="date"
        defaultValue="2017-05-24"
        className={classes.textField}
        onChange={(e) => editReminderDate(e.target.value)}
        disabled={taskCreating}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Checkbox
        icon={<StarOutline />}
        checkedIcon={<Star />}
        color="primary"
        name="checkedH"
        value={task.importance === 'high' ? 'normal' : 'high'}
        checked={task.importance === 'high'}
        onChange={(e) => editImportance(e.target.value)}
        disabled={taskCreating}
      />

      <Checkbox
        icon={<BookmarksOutlined />}
        checkedIcon={<Bookmarks />}
        color="primary"
        name="checkedH"
        value={selectedBookmarks}
        onChange={(e) => editBookmarks(e.target.value)}
        disabled={taskCreating}
      />

      <Button onClick={resetTask}>Reset</Button>

      <Fab size="small" color="primary" onClick={() => createTask(selectedTasklist, task)} disabled={taskCreating}>
        <Add />
      </Fab>
    </div>
  );
}

Popup.propTypes = {
  taskCreating: PropTypes.bool.isRequired,
  tasklistListLoading: PropTypes.bool.isRequired,
  selectedBookmarks: PropTypes.bool.isRequired,
  tasklistList: PropTypes.arrayOf(Tasklist).isRequired,
  selectedTasklist: PropTypes.instanceOf(Tasklist).isRequired,

  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.shape({
      content: PropTypes.string,
      contentType: PropTypes.oneOf(['text', 'htmlq']),
    }),
    reminderDateTime: PropTypes.instanceOf(Date),
    importance: PropTypes.oneOf(['high', 'normal', '']),
  }).isRequired,

  editTitle: PropTypes.func.isRequired,
  editBody: PropTypes.func.isRequired,
  editTasklist: PropTypes.func.isRequired,
  editReminderDate: PropTypes.func.isRequired,
  editBookmarks: PropTypes.func.isRequired,
  editImportance: PropTypes.func.isRequired,
  resetTask: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
};

export default Popup;
