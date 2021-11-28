import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { backgroundContext } from "../../../popup";

export const Com2: React.FC<any> = () => {
  const dispatch = useDispatch()
  const handleClick = useCallback(() => {
    dispatch(backgroundContext.appSlice.getTasklist(null))
  }, [])
  return <div onClick={handleClick}>getTasklist</div>;
};
export default Com2;
