import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import Add from '@material-ui/icons/Add';
import BookmarksOutlined from '@material-ui/icons/BookmarksOutlined';
import Star from '@material-ui/icons/Star';
import StarOutline from '@material-ui/icons/StarOutline';
import Bookmarks from '@material-ui/icons/Bookmarks';
import RotateLeft from '@material-ui/icons/RotateLeft';

const { Tasklist } = window;
// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles((theme) => ({}));

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
    <Grid container direction="column" spacing={2} className={classes.popupPage}>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Title"
          value={task.title}
          onChange={editTaskTitle}
          disabled={taskCreating}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Describe"
          multiline
          rowsMax={4}
          value={task.body.content}
          onChange={editTaskDescribe}
          disabled={taskCreating}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Reminder Date"
          type="datetime-local"
          value={task.reminderDateTime.dateTime}
          className={classes.textField}
          onChange={editReminderDateTime}
          disabled={taskCreating}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>

      <Grid container item direction="row" alignItems="center" spacing={2} xs={12}>
        <Grid item xs={8}>
          <FormControl style={{ width: '100%' }}>
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
        </Grid>

        <Grid item xs={2}>
          <Checkbox
            icon={<StarOutline fontSize="default" />}
            checkedIcon={<Star fontSize="default" />}
            color="secondary"
            name="checkedH"
            checked={importance}
            onChange={editImportance}
            onKeyUp={editImportance}
            disabled={taskCreating}
          />
        </Grid>

        <Grid item xs={2}>
          <Checkbox
            icon={<BookmarksOutlined fontSize="small" />}
            checkedIcon={<Bookmarks fontSize="small" />}
            color="secondary"
            name="checkedH"
            checked={bookmarked}
            onChange={editBookmarked}
            onKeyUp={editBookmarked}
            disabled={taskCreating}
          />
        </Grid>
      </Grid>

      <Grid container item direction="row" alignItems="center" xs={12}>
        <Grid item xs>
          <IconButton
            size="small"
            color="secondary"
            onClick={resetTask}
            onKeyUp={resetTask}
          >
            <RotateLeft />
          </IconButton>
        </Grid>

        <Grid item xs={10}>
          <Button
            style={{ width: '100%' }}
            size="small"
            variant="contained"
            color="primary"
            endIcon={taskCreating ? <CircularProgress size={20} /> : <Add />}
            onClick={createTask}
            onKeyUp={createTask}
            disabled={Boolean(taskCreating || tasklistListLoading || !selectedTasklistId)}
            disableElevation
          >
            { taskCreating ? '' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

Popup.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.shape({
      content: PropTypes.string,
      contentType: PropTypes.oneOf(['text', 'html']),
    }),
    reminderDateTime: PropTypes.shape({
      dateTime: PropTypes.string,
      timeZone: PropTypes.string.isRequired,
    }),
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
