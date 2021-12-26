import React, { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux";
import TaskForm from "./components/TaskForm";
import { backgroundContext } from "../../popup/";
import { useEffect } from "react";
import { logger } from "../../helpers/logger";
import Login from "./components/Login";

const { popupSlice } = backgroundContext;

const Default: React.FC<any> = () => {
  useEffect(() => {
    logger.timeEnd("theme");
  }, []);

  const dispatch = useDispatch();
  const creating = useSelector((state: State) => state.popup.creating);

  const reduxForm = useSelector((state: State) => state.popup.form);
  useEffect(() => {
    logger.log("reduxForm: ", reduxForm);
  }, [reduxForm]);

  const handleFormChange = useCallback((val) => {
    logger.log(val);
    // dispatch(popupSlice.actions.updateForm(val));
  }, []);

  const authed = useSelector((state: State) => state.auth.authenticationResult);
  if (!authed) return <Login />;
  return <TaskForm defaultValues={reduxForm} loading={creating} onChange={handleFormChange} />;
};

export default Default;
