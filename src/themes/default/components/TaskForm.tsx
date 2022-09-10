import React, { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Dispatch, State } from '../../../redux';
import { Controller, useForm } from 'react-hook-form';
import { logger } from '../../../helpers/logger';

import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import BookmarksOutlined from '@mui/icons-material/BookmarksOutlined';
import Star from '@mui/icons-material/Star';
import StarOutline from '@mui/icons-material/StarOutline';
import Bookmarks from '@mui/icons-material/Bookmarks';
import RotateLeft from '@mui/icons-material/RotateLeft';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import FormHelperText from '@mui/material/FormHelperText';
import Tooltip from '@mui/material/Tooltip';
import TasklistSelect from '../../../components/TasklistSelect';
import { now, timing } from '../../../helpers/report';
import { openUrl } from '../../../helpers';
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
  LANG_OPEN_OPTIONS_PAGE_TOOLTIP,
} from '../../../constants/lang';
import { OPTIONS_PAGE_URL } from '../../../constants';
import popupSlice from '../../../redux/popup';
import { createTaskAction } from '../../../redux/task';

const TaskForm: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State>();

  // loading 状态
  const creating = useSelector((state: State) => state.popup.creating);

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
  const autoResetPopup = useSelector((state: State) => state.options.form.autoResetPopup);
  const submit = useCallback(
    (val, err) => {
      logger.log('submit', val, err);
      dispatch(createTaskAction(val)).then(() => {
        autoResetPopup && handleReset();
      });
    },
    [autoResetPopup]
  );

  const handleClickOptions = useCallback(() => {
    openUrl({ url: OPTIONS_PAGE_URL });
  }, []);

  useEffect(() => {
    timing('popup form rendered', now());
  }, []);

  return (
    <Grid container item spacing={2}>
      <Grid item xs={12}>
        <Controller
          control={control}
          name="title"
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              id="popup-input-title"
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
          render={({ field }) => <TextField id="popup-input-desc" label={LANG_POPUP_DESCRIBE} maxRows={10} fullWidth multiline {...field} />}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          control={control}
          name="dateTime"
          render={({ field }) => (
            <TextField
              id="popup-input-remind-datetime"
              label={LANG_POPUP_DATETIME}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...field}
            />
          )}
        />
      </Grid>

      <Grid container item direction="row" alignItems="center" justifyContent="space-between" xs={12}>
        <Grid item xs={7} style={{ marginTop: '8px' }}>
          <FormControl error={Boolean(errors.tasklistId)} fullWidth required>
            <Controller
              control={control}
              name="tasklistId"
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <TasklistSelect label={LANG_POPUP_TASKLIST} {...field} />
                  {Boolean(errors.tasklistId) && <FormHelperText>{LANG_POPUP_TASKLIST_VALIDATION}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={1} style={{ marginTop: '8px' }}>
          <Controller
            control={control}
            name="importance"
            render={({ field }) => (
              <Tooltip title={LANG_POPUP_IMPORTANCE_TOOLTIP}>
                <Checkbox
                  id="popup-checkbox-importance"
                  color="primary"
                  icon={<StarOutline fontSize="medium" />}
                  checkedIcon={<Star fontSize="medium" />}
                  {...field}
                  checked={field.value}
                />
              </Tooltip>
            )}
          />
        </Grid>

        <Grid item xs={1} style={{ marginTop: '8px' }}>
          <Controller
            control={control}
            name="bookmark"
            render={({ field }) => (
              <Tooltip title={LANG_POPUP_BOOKMARK_TOOLTIP}>
                <Checkbox
                  id="popup-checkbox-bookmark"
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

        {/* More */}
        <Grid item xs={1} style={{ marginTop: '8px' }}>
          <Tooltip title={LANG_OPEN_OPTIONS_PAGE_TOOLTIP}>
            <IconButton id="popup-btn-options" size="small" onClick={handleClickOptions}>
              <MoreHorizIcon></MoreHorizIcon>
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <Grid container item direction="row" alignItems="center" xs={12}>
        <Grid item xs>
          <Tooltip title={LANG_POPUP_RESET}>
            <IconButton id="popup-btn-reset" size="small" onClick={handleReset}>
              <RotateLeft />
            </IconButton>
          </Tooltip>
        </Grid>

        <Grid item xs={10}>
          <Button
            id="popup-btn-add"
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
