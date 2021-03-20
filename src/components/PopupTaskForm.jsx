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
import { getEventValue, triggerByHotkey } from '../helpers';

const { Tasklist } = window;

const useStyles = makeStyles((theme) => ({
  resetBtn: {
    '&:hover': {
      color: theme.palette.secondary.light,
    },
  },

  fullWidth: {
    width: '100%',
  },

  iconFix: {
    marginTop: 8,
  },
}));

function Popup(props) {
  const classes = useStyles();
  const { form, tasklistList, taskCreating } = props;
  let {
    editTitle,
    editDescribe,
    editTasklist,
    editReminderDateTime,
    editImportance,
    editBookmarked,
    resetPopupform,
    popupformSubmit,
  } = props;

  editTitle = getEventValue(editTitle);
  editDescribe = getEventValue(editDescribe);
  editTasklist = getEventValue(editTasklist);
  editReminderDateTime = getEventValue(editReminderDateTime);
  editImportance = triggerByHotkey(editImportance);
  editBookmarked = triggerByHotkey(editBookmarked);
  resetPopupform = triggerByHotkey(resetPopupform);
  popupformSubmit = triggerByHotkey(popupformSubmit.bind(null, form.tasklistId, form));

  return (
    <Grid container direction="column" spacing={2} className={classes.popupPage}>
      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Title"
          value={form.title}
          onChange={editTitle}
          disabled={taskCreating}
          required
          fullWidth
          autoFocus
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          id="outlined-basic"
          label="Describe"
          rowsMax={4}
          value={form.describe}
          onChange={editDescribe}
          disabled={taskCreating}
          fullWidth
          multiline
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Reminder Date"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={form.reminderDateTime}
          onChange={editReminderDateTime}
          disabled={taskCreating}
          fullWidth
        />
      </Grid>

      <Grid container item direction="row" alignItems="center" spacing={2} xs={12}>
        <Grid item xs={8}>
          <FormControl fullWidth>
            <InputLabel id="task-list-label">Task List</InputLabel>
            <Select
              labelId="task-list-label"
              value={form.tasklistId}
              onChange={editTasklist}
              disabled={taskCreating}
            >
              {tasklistList.map((x) => <MenuItem key={x.id} value={x.id}>{x.displayName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <Checkbox
            color="secondary"
            className={classes.iconFix}
            icon={<StarOutline fontSize="default" />}
            checkedIcon={<Star fontSize="default" />}
            checked={form.importance}
            onChange={editImportance}
            onKeyUp={editImportance}
            disabled={taskCreating}
          />
        </Grid>

        <Grid item xs={2}>
          <Checkbox
            color="secondary"
            className={classes.iconFix}
            icon={<BookmarksOutlined fontSize="small" />}
            checkedIcon={<Bookmarks fontSize="small" />}
            checked={form.bookmarked}
            onChange={editBookmarked}
            onKeyUp={editBookmarked}
            disabled={taskCreating}
          />
        </Grid>
      </Grid>

      <Grid container item direction="row" alignItems="center" xs={12}>
        <Grid item xs>
          <IconButton
            className={classes.resetBtn}
            size="small"
            onClick={resetPopupform}
            onKeyUp={resetPopupform}
          >
            <RotateLeft />
          </IconButton>
        </Grid>

        <Grid item xs={10}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            className={classes.fullWidth}
            endIcon={taskCreating ? <CircularProgress size={20} /> : <Add />}
            onClick={popupformSubmit}
            onKeyUp={popupformSubmit}
            // TODO: disable status move to redux
            disabled={Boolean(taskCreating || !form.tasklistId || !form.title.trim())}
            disableElevation
          >
            { taskCreating ? '' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}

const popupTaskForm = PropTypes.shape({
  title: PropTypes.string.isRequired,
  describe: PropTypes.string,
  reminderDateTime: PropTypes.string,
  tasklistId: PropTypes.string.isRequired,
  importance: PropTypes.bool.isRequired,
  bookmarked: PropTypes.bool.isRequired,
});

export const popupTaskFormPropTypes = {
  form: popupTaskForm.isRequired,
  tasklistList: PropTypes.arrayOf(PropTypes.instanceOf(Tasklist)).isRequired,
  taskCreating: PropTypes.bool.isRequired,
  // fetchingTasklistList: PropTypes.bool.isRequired,

  editTitle: PropTypes.func.isRequired,
  editDescribe: PropTypes.func.isRequired,
  editReminderDateTime: PropTypes.func.isRequired,
  editTasklist: PropTypes.func.isRequired,
  editBookmarked: PropTypes.func.isRequired,
  editImportance: PropTypes.func.isRequired,
  resetPopupform: PropTypes.func.isRequired,
  popupformSubmit: PropTypes.func.isRequired,
};

Popup.propTypes = popupTaskFormPropTypes;

export default Popup;
