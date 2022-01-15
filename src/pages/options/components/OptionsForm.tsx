import { FormControl, FormControlLabel, FormHelperText, FormLabel, InputLabel, Radio, RadioGroup, Switch, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector, useStore } from 'react-redux';
import TasklistSelect from '../../../components/TasklistSelect';
import { ISSUE_URL, RATE_URL } from '../../../constants';
import { EQuickTaskTitle } from '../../../constants/enums';
import { LANG_OPTIONS_ISSUE_TEXT, LANG_OPTIONS_RATE_TEXT } from '../../../constants/lang';
import { backgroundContext } from '../../../helpers/loader';
import { Dispatch, State } from '../../../redux';
import BuyMeACoffee from '../../../themes/default/components/BuyMeACoffee';

const OptionsForm: React.FC = () => {
  const { optionsSlice } = backgroundContext;
  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State>();

  const defaultValues = useMemo(() => store.getState().options.form, []);
  const { watch, control, setValue } = useForm({ defaultValues });

  useEffect(() => {
    watch((val) => dispatch(optionsSlice.actions.updateForm(val)));
  }, []);

  // 更新 tasklistId
  const tasklistId = useSelector((state: State) => state.options.form.quickAddTaskTasklistId);
  useEffect(() => {
    setValue('quickAddTaskTasklistId', tasklistId);
  }, [tasklistId]);


  const handleBtnClick = useCallback((e) => {
    console.log(e.target);
  }, [])


  const enableQuickAdd = useSelector((state: State) => state.options.form.enableQuickAdd);
  const quickAddTasOptionskRender = useCallback(() => {
    return enableQuickAdd ? (
      <>
        {/* quickAddTaskTasklist */}
        <Grid item xs={12} lg={12}>
          <FormControl fullWidth>
            <InputLabel id="options-quck-add-task-list">Quick add task 任务列表</InputLabel>
            <Controller
              control={control}
              name="quickAddTaskTasklistId"
              render={({ field }) => <TasklistSelect labelId="options-quck-add-task-list" {...field} />}
            />
            <FormHelperText>选择 Quick add task 的目标任务列表</FormHelperText>
          </FormControl>
        </Grid>

        {/*  */}
        <Grid item xs={12} lg={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Quick add task 标题</FormLabel>
            <Controller
              control={control}
              name="quickTaskTitleType"
              render={({ field }) => (
                <RadioGroup {...field}>
                  <FormControlLabel
                    value={EQuickTaskTitle.SELECTION}
                    control={<Radio id={`options-quick-add-title-${field.value}`} color="primary" />}
                    label="选中文本"
                  />
                  <FormControlLabel
                    value={EQuickTaskTitle.ACTIVE_TAB}
                    control={<Radio id={`options-quick-add-title-${field.value}`} color="primary" />}
                    label="页面 Title"
                  />
                </RadioGroup>
              )}
            />
            <FormHelperText>Quick add task 填充任务标题的方式</FormHelperText>
          </FormControl>
        </Grid>
      </>
    ) : null;
  }, [enableQuickAdd]);

  return (
    <Grid container item spacing={6}>
      {/* Quick add task */}
      <Grid container item xs={12} lg={12} spacing={3}>
        {/* enableQuickAdd */}
        <Grid item xs={12} lg={12}>
          <Controller
            control={control}
            name="enableQuickAdd"
            render={({ field }) => (
              <FormControlLabel
                label="开启 Quick add task"
                control={<Switch id={`options-quick-add-${field.value}`} {...field} checked={field.value} color="primary" />}
              />
            )}
          />
        </Grid>
        {quickAddTasOptionskRender()}
      </Grid>

      {/* Create task */}
      <Grid container item xs={12} lg={12}>
        <Grid item xs={12} lg={12}>
          <Controller
            control={control}
            name="autoResetPopup"
            render={({ field }) => (
              <FormControlLabel
                control={<Switch id={`options-auto-reset-${field.value}`} {...field} checked={field.value} color="primary" />}
                label="Task 创建成功自动重置表单"
              />
            )}
          />

          <FormHelperText>balabala...</FormHelperText>
        </Grid>
      </Grid>

      {/* Btns */}
      <Grid container item xs={12} lg={12} spacing={2}>
        <Grid item>
          <Button variant="contained" data-url={ISSUE_URL} onClick={handleBtnClick}>
            {LANG_OPTIONS_ISSUE_TEXT}
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" data-url={RATE_URL} onClick={handleBtnClick}>
            {LANG_OPTIONS_RATE_TEXT}
          </Button>
        </Grid>
        <Grid item>
          <BuyMeACoffee />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OptionsForm;
