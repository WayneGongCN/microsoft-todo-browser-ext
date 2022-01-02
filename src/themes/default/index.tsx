import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../redux";
import TaskForm from "./components/TaskForm";
import { useEffect } from "react";
import { logger } from "../../helpers/logger";
import Login from "./components/Login";
import { Container } from "@material-ui/core";
import OpenMSTodo from "./components/OpenMSToDo";

const Default: React.FC<any> = () => {
  useEffect(() => {
    logger.timeEnd("theme");
  }, []);

  const reduxForm = useSelector((state: State) => state.popup.form);
  useEffect(() => {
    logger.log("reduxForm: ", reduxForm);
  }, [reduxForm]);

  const handleFormChange = useCallback((val) => {
    logger.log(val);
    // dispatch(popupSlice.actions.updateForm(val));
  }, []);

  const authed = useSelector((state: State) => state.auth.authenticationResult);
  return (
    <Container style={{ width: 350, padding: 10 }}>
      <OpenMSTodo />
      {/* <TaskForm defaultValues={reduxForm} onChange={handleFormChange} /> */}
      {authed ? <TaskForm defaultValues={reduxForm} onChange={handleFormChange} /> : <Login />}
    </Container>
  )
  
};

export default Default;
