import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logger } from "../../../helpers/logger";
import { backgroundContext } from "../../../popup";

const Login: React.FC<any> = () => {
  const dispatch = useDispatch();
  const handleLogin = useCallback(() => {
    logger.log('msalInstance', backgroundContext)
    dispatch(backgroundContext.appSlice.authentication(null))
  }, [])

  return <div onClick={handleLogin}>Login</div>;
  // return <div >Default</div>
};

export default Login;
