import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import RotateLeft from '@material-ui/icons/RotateLeft';

const { Tasklist } = window;
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
    bookmarked,

    tasklistList,
    selectedTasklistId,

    task,
    editTaskTitle,
    editTaskDescribe,
    editSelectedTasklist,
    editReminderDateTime,
    editBookmarked,
    editImportance,
    resetTask,
    createTask,

    importance,
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.popupPage}>
      <TextField id="outlined-basic" label="Title" value={task.title} onChange={editTaskTitle} disabled={taskCreating} />
      <TextField id="outlined-basic" label="Describe" value={task.body.content} onChange={editTaskDescribe} disabled={taskCreating} />

      <FormControl className={classes.formControl}>
        <InputLabel id="task-list-label">Task List</InputLabel>
        <Select
          labelId="task-list-label"
          id="task-list-select"
          value={selectedTasklistId}
          onChange={editSelectedTasklist}
          disabled={taskCreating || tasklistListLoading}
        >
          {tasklistList.map((x) => <MenuItem key={x.id} value={x.id}>{x.displayName}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField
        label="Reminder Date"
        type="datetime-local"
        value={task.reminderDateTime}
        className={classes.textField}
        onChange={editReminderDateTime}
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
        checked={importance}
        onChange={editImportance}
        onKeyUp={editImportance}
        disabled={taskCreating}
      />

      <Checkbox
        icon={<BookmarksOutlined />}
        checkedIcon={<Bookmarks />}
        color="primary"
        name="checkedH"
        checked={bookmarked}
        onChange={editBookmarked}
        onKeyUp={editBookmarked}
        disabled={taskCreating}
      />

      <Button
        size="small"
        variant="outlined"
        color="secondary"
        startIcon={<RotateLeft />}
        onClick={resetTask}
        onKeyUp={resetTask}
        disableElevation
      >
        Reset
      </Button>

      <Button
        size="small"
        variant="contained"
        color="primary"
        endIcon={<Add />}
        onClick={createTask}
        onKeyUp={createTask}
        disabled={taskCreating}
        disableElevation
      >
        Add
      </Button>
    </div>
  );
}

Popup.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.shape({
      content: PropTypes.string,
      contentType: PropTypes.oneOf(['text', 'html']),
    }),
    reminderDateTime: PropTypes.string.isRequired,
    importance: PropTypes.oneOf(['high', 'normal']),
  }).isRequired,

  tasklistList: PropTypes.arrayOf(PropTypes.instanceOf(Tasklist)).isRequired,
  selectedTasklistId: PropTypes.string.isRequired,

  importance: PropTypes.bool.isRequired,
  bookmarked: PropTypes.bool.isRequired,
  taskCreating: PropTypes.bool.isRequired,
  tasklistListLoading: PropTypes.bool.isRequired,

  editTaskTitle: PropTypes.func.isRequired,
  editTaskDescribe: PropTypes.func.isRequired,
  editReminderDateTime: PropTypes.func.isRequired,
  editSelectedTasklist: PropTypes.func.isRequired,
  editBookmarked: PropTypes.func.isRequired,
  editImportance: PropTypes.func.isRequired,
  resetTask: PropTypes.func.isRequired,
  createTask: PropTypes.func.isRequired,
};

export default Popup;
