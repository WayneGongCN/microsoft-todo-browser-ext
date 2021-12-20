import { Button } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { backgroundContext } from "../../../popup/";

const { authSlice } = backgroundContext

const Login: React.FC<any> = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.auth.loading);


  const handleLogin = useCallback(() => {
    dispatch(authSlice.authentication())
  }, [dispatch])

  
  if (loading) return <h2>Loading ...</h2>
  else return <Button onClick={handleLogin}>Login</Button>
};


export default Login;
