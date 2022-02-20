import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Dispatch, State } from '../../../redux';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import TasklistSelect from '../../../components/TasklistSelect';
import { now, timing } from '../../../helpers/report';
import { EQuickTaskTitle } from '../../../constants/enums';
import {
  LANG_LOGIN_TIP,
  LANG_OPTIONS_ENABLE_AUTO_RESET,
  LANG_OPTIONS_ENABLE_AUTO_RESET_HELP,
  LANG_OPTIONS_ENABLE_QUICK_ADD,
  LANG_OPTIONS_ENABLE_QUICK_ADD_HELP,
  LANG_OPTIONS_QUICK_ADD_TASKLIST,
  LANG_OPTIONS_QUICK_ADD_TASKLIST_HELP,
  LANG_OPTIONS_QUICK_ADD_TITLE,
  LANG_OPTIONS_QUICK_ADD_TITLE_HELP,
  LANG_OPTIONS_QUICK_ADD_TITLE_SELECTION,
  LANG_OPTIONS_QUICK_ADD_TITLE_TAB_TITLE,
} from '../../../constants/lang';
import optionsSlice from '../../../redux/options';

const OptionsForm: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State>();

  // form
  const defaultValues = useMemo(() => store.getState().options.form, []);
  const { watch, control, setValue } = useForm({ defaultValues });

  // redux
  useEffect(() => {
    watch((val) => dispatch(optionsSlice.actions.updateForm(val)));
  }, []);

  // tasklist
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);
  const tasklistId = useSelector((state: State) => state.options.form.quickAddTaskTasklistId);
  useEffect(() => {
    setValue('quickAddTaskTasklistId', tasklistId);
  }, [tasklistId]);

  useEffect(() => {
    timing('options form rendered', now());
  }, []);

  // render
  const enableQuickAdd = useSelector((state: State) => state.options.form.enableQuickAdd);
  const quickAddTaskOptions = useCallback(() => {
    return enableQuickAdd ? (
      <>
        {/* quickAddTaskTasklist */}
        <Grid item xs={12} lg={12}>
          <FormControl fullWidth>
            <Controller
              name="quickAddTaskTasklistId"
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, ...field } }) => <TasklistSelect label={account ? LANG_OPTIONS_QUICK_ADD_TASKLIST : LANG_LOGIN_TIP} {...field} />}
            />
            <FormHelperText>{LANG_OPTIONS_QUICK_ADD_TASKLIST_HELP}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} lg={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">{LANG_OPTIONS_QUICK_ADD_TITLE}</FormLabel>
            <Controller
              name="quickTaskTitleType"
              control={control}
              render={({ field }) => (
                <RadioGroup {...field}>
                  <FormControlLabel
                    label={LANG_OPTIONS_QUICK_ADD_TITLE_SELECTION}
                    value={EQuickTaskTitle.SELECTION}
                    control={<Radio color="primary" id={`options-quick-add-title-${field.value}`} />}
                  />
                  <FormControlLabel
                    label={LANG_OPTIONS_QUICK_ADD_TITLE_TAB_TITLE}
                    value={EQuickTaskTitle.ACTIVE_TAB}
                    control={<Radio color="primary" id={`options-quick-add-title-${field.value}`} />}
                  />
                </RadioGroup>
              )}
            />
            <FormHelperText>{LANG_OPTIONS_QUICK_ADD_TITLE_HELP}</FormHelperText>
          </FormControl>
        </Grid>
      </>
    ) : null;
  }, [enableQuickAdd]);

  return (
    <Grid container item spacing={4}>
      {/* Quick add task */}
      <Grid container item xs={12} lg={12} spacing={3}>
        {/* enableQuickAdd */}
        <Grid item xs={12} lg={12}>
          <Controller
            name="enableQuickAdd"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label={LANG_OPTIONS_ENABLE_QUICK_ADD}
                control={<Switch color="primary" id={`options-quick-add-${field.value}`} {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText>{LANG_OPTIONS_ENABLE_QUICK_ADD_HELP}</FormHelperText>
        </Grid>
        {quickAddTaskOptions()}
      </Grid>

      {/* Create task */}
      <Grid container item xs={12} lg={12}>
        <Grid item xs={12} lg={12}>
          <Controller
            name="autoResetPopup"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label={LANG_OPTIONS_ENABLE_AUTO_RESET}
                control={<Switch color="primary" id={`options-auto-reset-${field.value}`} {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText>{LANG_OPTIONS_ENABLE_AUTO_RESET_HELP}</FormHelperText>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OptionsForm;
