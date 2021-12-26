import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { Controller, useForm } from "react-hook-form";
import { IPopupForm } from "../../../../types";
import { backgroundContext } from "../../../popup";
import { DEFAULT_FORM_VALS } from "../../../constants";
import { logger } from "../../../helpers/logger";

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
import BookmarksOutlined from "@material-ui/icons/BookmarksOutlined";
import Star from "@material-ui/icons/Star";
import StarOutline from "@material-ui/icons/StarOutline";
import Bookmarks from "@material-ui/icons/Bookmarks";
import RotateLeft from "@material-ui/icons/RotateLeft";
import { FormHelperText, Tooltip } from "@material-ui/core";

const { tasklistSlice, taskSlice } = backgroundContext;

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

  useEffect(() => {
    logger.log('mounted init onChange')
    watch(onChange);
  }, []);

  const tasklists = useSelector((state: State) => state.tasklist.lists);
  const loadingTasklists = useSelector(
    (state: State) => state.tasklist.loading
  );
  useEffect(() => {
    logger.log('mounted getTasklist')
    dispatch(tasklistSlice.getTasklist());
  }, []);

  const submit = useCallback((val, err) => {
    logger.log("submit", val, err);
    dispatch(taskSlice.createTask(val));
  }, []);

  const handleReset = useCallback(() => {
    logger.log("handleReset reset form");
    reset({...DEFAULT_FORM_VALS}); 
  }, [reset]);

  useEffect(() => {
    logger.log('defaultValues change, reset form')
    reset(defaultValues)
  }, [defaultValues])

  console.log('Render')
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              label="Title"
              fullWidth
              autoFocus
              required
              helperText={errors.title && "Title is required."}
              error={Boolean(errors.title)}
              {...field}
            />
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
          <FormControl error={Boolean(errors.tasklistId)} fullWidth required>
            <InputLabel id="task-list-label">Task List</InputLabel>
            <Controller
              control={control}
              name="tasklistId"
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Select labelId="task-list-label" {...field}>
                    {tasklists.map((x) => (
                      <MenuItem key={x.id} value={x.id}>
                        {x.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                  {Boolean(errors.tasklistId) && (
                    <FormHelperText>Tasklist is required.</FormHelperText>
                  )}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={2}>
          <Controller
            control={control}
            name="importance"
            render={({ field }) => (
              <Tooltip title="Importance">
                <Checkbox
                  color="secondary"
                  icon={<StarOutline fontSize="medium" />}
                  checkedIcon={<Star fontSize="medium" />}
                  {...field}
                  checked={field.value}
                />
              </Tooltip>
            )}
          />
        </Grid>

        <Grid item xs={2}>
          <Controller
            control={control}
            name="bookmarked"
            render={({ field }) => (
              <Tooltip title="Bookmarked">
                <Checkbox
                  color="secondary"
                  icon={<BookmarksOutlined fontSize="small" />}
                  checkedIcon={<Bookmarks fontSize="small" />}
                  {...field}
                  checked={field.value}
                />
              </Tooltip>
            )}
          />
        </Grid>
      </Grid>

      <Grid container item direction="row" alignItems="center" xs={12}>
        <Grid item xs>
          <Tooltip title="Reset">
            <IconButton size="small" onClick={handleReset}>
              <RotateLeft />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={10}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} /> : null}
            disableElevation
            disabled={loading}
            onClick={handleSubmit(submit)}
            fullWidth
          >
            {loading ? "" : "Add a task"}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TaskForm;
