import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Dispatch, State } from '../../../redux';
import { Controller, useForm } from 'react-hook-form';
import { logger } from '../../../helpers/logger';

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
import BookmarksOutlined from '@material-ui/icons/BookmarksOutlined';
import Star from '@material-ui/icons/Star';
import StarOutline from '@material-ui/icons/StarOutline';
import Bookmarks from '@material-ui/icons/Bookmarks';
import RotateLeft from '@material-ui/icons/RotateLeft';
import FormHelperText from '@material-ui/core/FormHelperText';
import Tooltip from '@material-ui/core/Tooltip';
import {
  LANG_POPUP_TITLE,
  LANG_POPUP_DESCRIBE,
  LANG_POPUP_DATETIME,
  LANG_POPUP_TASKLIST,
  LANG_POPUP_TASKLIST_VALIDATION,
  LANG_POPUP_IMPORTANCE_TOOLTIP,
  LANG_POPUP_BOOKMARK_TOOLTIP,
  LANG_POPUP_RESET,
  LANG_POPUP_CREATING,
  LANG_POPUP_ADDTASK,
  LANG_POPUP_TITLE_VALIDATION,
} from '../../../constants/lang';
import { backgroundContext } from '../..';

const { tasklistSlice, taskSlice, popupSlice } = backgroundContext;

const TaskForm: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State>();

  // loading 状态
  const creating = useSelector((state: State) => state.popup.creating);
  const loadingTasklist = useSelector((state: State) => state.popup.loadingTasklist);

  // 获取表单初始状态（仅首次渲染时获取）
  const defaultValues = useMemo(() => store.getState().popup.form, []);
  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  // form 变化时更新 redux
  useEffect(() => {
    watch((val) => dispatch(popupSlice.actions.updateForm(val)));
  }, []);

  // 获取 tasklist
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  useEffect(() => {
    dispatch(tasklistSlice.getTasklist());
  }, []);

  // 更新 tasklistId
  const tasklistId = useSelector((state: State) => state.popup.form.tasklistId);
  useEffect(() => {
    setValue('tasklistId', tasklistId);
  }, [tasklistId]);

  // 重置表单
  const handleReset = useCallback(() => {
    dispatch(popupSlice.actions.resetForm());
    reset(store.getState().popup.form);
  }, []);

  // 提交表单
  const submit = useCallback((val, err) => {
    logger.log('submit', val, err);
    dispatch(taskSlice.createTask(val)).then(handleReset);
  }, []);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              label={LANG_POPUP_TITLE}
              fullWidth
              autoFocus
              required
              helperText={errors.title && LANG_POPUP_TITLE_VALIDATION}
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
          render={({ field }) => <TextField label={LANG_POPUP_DESCRIBE} maxRows={10} fullWidth multiline {...field} />}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={control}
          name="dateTime"
          render={({ field }) => <TextField label={LANG_POPUP_DATETIME} type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth {...field} />}
        />
      </Grid>

      <Grid container item direction="row" alignItems="center" spacing={2} xs={12}>
        <Grid item xs={8}>
          <FormControl error={Boolean(errors.tasklistId)} fullWidth required>
            <InputLabel id="task-list-label">{LANG_POPUP_TASKLIST}</InputLabel>
            <Controller
              control={control}
              name="tasklistId"
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Select labelId="task-list-label" disabled={loadingTasklist} {...field}>
                    {tasklists.map((x) => (
                      <MenuItem key={x.id} value={x.id}>
                        {x.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                  {Boolean(errors.tasklistId) && <FormHelperText>{LANG_POPUP_TASKLIST_VALIDATION}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={2} style={{ marginTop: '8px' }}>
          <Controller
            control={control}
            name="importance"
            render={({ field }) => (
              <Tooltip title={LANG_POPUP_IMPORTANCE_TOOLTIP}>
                <Checkbox color="primary" icon={<StarOutline fontSize="medium" />} checkedIcon={<Star fontSize="medium" />} {...field} checked={field.value} />
              </Tooltip>
            )}
          />
        </Grid>

        <Grid item xs={2} style={{ marginTop: '8px' }}>
          <Controller
            control={control}
            name="bookmark"
            render={({ field }) => (
              <Tooltip title={LANG_POPUP_BOOKMARK_TOOLTIP}>
                <Checkbox
                  color="primary"
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
          <Tooltip title={LANG_POPUP_RESET}>
            <IconButton size="small" color="secondary" onClick={handleReset}>
              <RotateLeft />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={10}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            endIcon={creating ? <CircularProgress size={20} /> : null}
            disabled={creating}
            onClick={handleSubmit(submit)}
            fullWidth
          >
            {creating ? LANG_POPUP_CREATING : LANG_POPUP_ADDTASK}
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default TaskForm;
