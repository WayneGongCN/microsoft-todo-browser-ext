import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Dispatch, State } from '../../../redux';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import { TextField, MenuItem, FormControl } from '@mui/material';
import TasklistSelect from '../../../components/TasklistSelect';
import { now, timing } from '../../../helpers/report';
import optionsSlice, { FillMode } from '../../../redux/options';
import {
  LANG_LOGIN_TIP,
  LANG_OPTIONS_AUTO_PADDING_DESC,
  LANG_OPTIONS_AUTO_PADDING_MODE,
  LANG_OPTIONS_AUTO_PADDING_MODE_HELP,
  LANG_OPTIONS_AUTO_PADDING_TITLE,
  LANG_OPTIONS_DEFAULT_TASKLIST,
  LANG_OPTIONS_DEFAULT_TASKLIST_HELP,
  LANG_OPTIONS_ENABLE_AUTO_PADDING,
  LANG_OPTIONS_ENABLE_AUTO_PADDING_HELP,
  LANG_OPTIONS_ENABLE_AUTO_RESET,
  LANG_OPTIONS_ENABLE_AUTO_RESET_HELP,
  LANG_OPTIONS_ENABLE_FORCE_PADDING,
  LANG_OPTIONS_ENABLE_FORCE_PADDING_HELP,
  LANG_OPTIONS_ENABLE_KEEPLAST_TASKLIST,
  LANG_OPTIONS_ENABLE_KEEPLAST_TASKLIST_HELP,
} from '../../../constants/lang';


const PADDING_TYPE_MAP = {
  [FillMode.TITLE]: LANG_OPTIONS_AUTO_PADDING_TITLE,
  [FillMode.DESC]: LANG_OPTIONS_AUTO_PADDING_DESC,
}


const mapState = (state: State) => {
  const { enableAutoFill, enableKeepLastTasklist } = state.options.form;
  const account = state.auth.authenticationResult?.account;

  return {
    account,
    enableAutoFill,
    enableKeepLastTasklist
  }
}


const OptionsForm: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const store = useStore<State>();
  const { enableAutoFill, enableKeepLastTasklist, account } = useSelector(mapState);

  const defaultValues = useMemo(() => store.getState().options.form, []);
  const { watch, control } = useForm({ defaultValues });

  useEffect(() => {
    watch((val) => dispatch(optionsSlice.actions.updateForm(val)));
  }, []);

  useEffect(() => {
    timing('options form rendered', now());
  }, []);

  return (
    <Grid container item spacing={5}>
      {/* Tasklist options */}
      <Grid container item xs={12} lg={12} spacing={3}>
        <Grid item xs={12} lg={12}>
          <Controller
            name="enableKeepLastTasklist"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                labelPlacement='start'
                label={LANG_OPTIONS_ENABLE_KEEPLAST_TASKLIST}
                control={<Switch color="primary" {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText variant="outlined">{LANG_OPTIONS_ENABLE_KEEPLAST_TASKLIST_HELP}</FormHelperText>
        </Grid>
        {
          !enableKeepLastTasklist && (
            <Grid item xs={12} lg={12}>
              <FormControl >
                <Controller
                  name="defaultTasklistId"
                  control={control}
                  render={({ field }) => <TasklistSelect size='small' defaultIdx={0} style={{ marginLeft: '1em', width: '20em' }} label={account ? LANG_OPTIONS_DEFAULT_TASKLIST : LANG_LOGIN_TIP} {...field} />}
                />
                <FormHelperText>{LANG_OPTIONS_DEFAULT_TASKLIST_HELP}</FormHelperText>
              </FormControl>
            </Grid>
          )
        }
      </Grid>

      {/* Auto fill options */}
      <Grid container item xs={12} lg={12} spacing={3}>
        <Grid item xs={12} lg={12}>
          <Controller
            name="enableAutoFill"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                labelPlacement='start'
                label={LANG_OPTIONS_ENABLE_AUTO_PADDING}
                control={<Switch color="primary" {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText variant="outlined">{LANG_OPTIONS_ENABLE_AUTO_PADDING_HELP}</FormHelperText>
        </Grid>


        {
          enableAutoFill && (
            <>
              <Grid item xs={12} lg={12}>
                <Controller
                  name="enableForceFill"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      labelPlacement='start'
                      label={LANG_OPTIONS_ENABLE_FORCE_PADDING}
                      control={<Switch color="primary" {...field} checked={field.value} />}
                    />
                  )}
                />
                <FormHelperText variant="outlined">{LANG_OPTIONS_ENABLE_FORCE_PADDING_HELP}</FormHelperText>
              </Grid>

              <Grid item xs={12} lg={12}>
                <FormControl>
                  <Controller
                    name="fillMode"
                    control={control}
                    render={({ field }) => <TextField label={LANG_OPTIONS_AUTO_PADDING_MODE} size='small' select {...field} style={{ marginLeft: '1em', width: '20em' }}>
                      {
                        Object.keys(PADDING_TYPE_MAP).map((value: keyof typeof PADDING_TYPE_MAP) => (
                          <MenuItem key={value} value={value}>
                            {PADDING_TYPE_MAP[value]}
                          </MenuItem>
                        ))
                      }
                    </TextField>}
                  />
                  <FormHelperText>{LANG_OPTIONS_AUTO_PADDING_MODE_HELP}</FormHelperText>
                </FormControl>
              </Grid>
            </>
          )
        }
      </Grid>

      {/* Flag options */}
      <Grid container item xs={12} lg={12} spacing={3}>
        <Grid item xs={12} lg={12}>
          <Controller
            name="enableResetPopupForm"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                labelPlacement='start'
                label={LANG_OPTIONS_ENABLE_AUTO_RESET}
                control={<Switch color="primary" {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText variant="outlined">{LANG_OPTIONS_ENABLE_AUTO_RESET_HELP}</FormHelperText>
        </Grid>


        {/* <Grid item xs={12} lg={12} >
          <Controller
            name="enableNotifacation"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                labelPlacement='start'
                label={LANG_OPTIONS_ENABLE_AUTO_RESET}
                control={<Switch color="primary" {...field} checked={field.value} />}
              />
            )}
          />
          <FormHelperText variant="outlined">{LANG_OPTIONS_ENABLE_AUTO_RESET_HELP}</FormHelperText>
        </Grid> */}

      </Grid>
    </Grid >
  );
};

export default OptionsForm;
