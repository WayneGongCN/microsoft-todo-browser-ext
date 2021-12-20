import React, { memo, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux";
import TaskForm from "./components/TaskForm";
import { backgroundContext } from "../../popup/";
import { useEffect } from "react";
import { logger } from "../../helpers/logger";
import Login from "./components/Login";

const MemoTaskFrom = memo(TaskForm)
const {authSlice, popupSlice} = backgroundContext

const Default: React.FC<any> = () => {
  useEffect(() => {
    logger.timeEnd('theme')
  }, [])

  const dispatch = useDispatch ();
  const creating = useSelector ((state: State) => state.popup.creating);

  const reduxForm = useRef(useSelector((state: State) => state.popup.form));
  useEffect(() => {
    logger.log('reduxForm: ', reduxForm.current)
  }, [reduxForm])

  const handleFormChange = useCallback((val) => {
    logger.log(val)
    dispatch(popupSlice.actions.updateForm(val))
  }, [])

  const authed = useSelector((state: State) => state.auth.authenticationResult)
  if (!authed) return <Login />
  return <MemoTaskFrom defaultValues={reduxForm.current} loading={creating} onChange={handleFormChange}/>;
};

export default Default;
