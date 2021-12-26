import { Button, CircularProgress, Container } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { backgroundContext } from "../../../popup/";

const { authSlice } = backgroundContext;

const Login: React.FC<any> = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state: State) => state.auth.loading);

  const handleLogin = useCallback(() => {
    dispatch(authSlice.authentication());
  }, [dispatch]);

  return (
    <Container style={{margin: '12px 0'}}>
      <Button
        fullWidth
        color="primary"
        variant="contained"
        disabled={loading}
        endIcon={loading ? <CircularProgress size={20} /> : null}
        onClick={handleLogin}
      >
        {loading ? "Loading ..." : "Login"}
      </Button>
    </Container>
  );
};

export default Login;
