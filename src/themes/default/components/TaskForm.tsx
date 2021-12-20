import React, { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { Controller, useForm } from "react-hook-form";

import makeStyles from "@material-ui/core/styles/makeStyles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Add from "@material-ui/icons/Add";
import BookmarksOutlined from "@material-ui/icons/BookmarksOutlined";
import Star from "@material-ui/icons/Star";
import StarOutline from "@material-ui/icons/StarOutline";
import Bookmarks from "@material-ui/icons/Bookmarks";
import RotateLeft from "@material-ui/icons/RotateLeft";
import { ICreateTaskParams, IPopupForm } from "../../../../types";
import { backgroundContext } from "../../../popup";
import { DEFAULT_FORM_VALS } from "../../../constants";
import { logger } from "../../../helpers/logger";

const { tasklistSlice, taskSlice } = backgroundContext;

// const useStyles = makeStyles((theme) => ({
//   resetBtn: {
//     "&:hover": {
//       color: theme.palette.secondary.light,
//     },
//   },

//   fullWidth: {
//     width: "100%",
//   },

//   iconFix: {
//     marginTop: 8,
//   },
// }));
type TaskFormProps = {
  defaultValues: IPopupForm;
  loading: boolean;
  onChange: (val: IPopupForm) => void;
};

const TaskForm: React.FC<any> = ({
  defaultValues,
  loading,
  onChange,
}: TaskFormProps) => {
  const dispatch = useDispatch();
  const {
    watch,
    reset,
    register,
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  /**
   *
   */
  const [disableSubmit, setDisableSubmit] = useState(true);
  useEffect(() => {
    watch((val) => {
      onChange(val);
      const { title, tasklistId } = val;
      setDisableSubmit(loading || !title || !tasklistId);
    });
  }, []);

  /**
   * inital disableSubmit state
   */
  useEffect(() => {
    setDisableSubmit(
      loading || !getValues("title") || !getValues("tasklistId")
    );
  }, [loading, getValues]);

  /**
   *
   */
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  const loadingTasklists = useSelector(
    (state: State) => state.tasklist.loading
  );
  useEffect(() => {
    dispatch(tasklistSlice.getTasklist());
  }, []);

  const submit = useCallback((val, err) => {
    dispatch(taskSlice.createTask(val));
    logger.log("submit", val, err);
  }, []);

  const handleReset = useCallback(() => {
    logger.log("reset");
    reset(DEFAULT_FORM_VALS);
  }, [reset]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField label="Title" fullWidth autoFocus {...field} />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={control}
          name="describe"
          render={({ field }) => (
            <TextField
              label="Describe"
              maxRows={4}
              fullWidth
              multiline
              {...field}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={control}
          name="dateTime"
          render={({ field }) => (
            <TextField
              label="Reminder Date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...field}
            />
          )}
        />
      </Grid>

      <Grid
        container
        item
        direction="row"
        alignItems="center"
        spacing={2}
        xs={12}
      >
        <Grid item xs={8}>
          <FormControl fullWidth>
            <InputLabel id="task-list-label">Task List</InputLabel>
            <Controller
              control={control}
              name="tasklistId"
              render={({ field }) => (
                <Select labelId="task-list-label" {...field}>
                  {tasklists.map((x) => (
                    <MenuItem key={x.id} value={x.id}>
                      {x.displayName}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <Controller
            control={control}
            name="tasklistId"
            render={({ field }) => (
              <Checkbox
                color="secondary"
                icon={<StarOutline fontSize="medium" />}
                checkedIcon={<Star fontSize="medium" />}
                {...field}
              />
            )}
          />
        </Grid>

        <Grid item xs={2}>
          <Controller
            control={control}
            name="tasklistId"
            render={({ field }) => (
              <Checkbox
                color="secondary"
                icon={<BookmarksOutlined fontSize="small" />}
                checkedIcon={<Bookmarks fontSize="small" />}
                {...field}
              />
            )}
          />
        </Grid>
      </Grid>

      <Grid container item direction="row" alignItems="center" xs={12}>
        <Grid item xs>
          <IconButton size="small" onClick={handleReset}>
            <RotateLeft />
          </IconButton>
        </Grid>

        <Grid item xs={10}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} /> : <Add />}
            disableElevation
            disabled={disableSubmit}
            onClick={handleSubmit(submit)}
          >
            {loading ? "" : "Add"}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TaskForm;
