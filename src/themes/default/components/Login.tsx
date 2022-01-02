import { Button, CircularProgress, Container } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { backgroundContext } from "../../../popup/";
import { LANG_POPUP_LOADING_TEXT, LANG_POPUP_LOGIN_TEXT } from "../../../constants/lang";

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
        {loading ? LANG_POPUP_LOADING_TEXT + "..." : LANG_POPUP_LOGIN_TEXT}
      </Button>
    </Container>
  );
};

export default Login;
