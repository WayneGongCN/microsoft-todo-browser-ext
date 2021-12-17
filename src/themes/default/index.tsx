import React, { useEffect } from "react";
import Com1 from "./components/Com1";
import Com2 from "./components/Com2";
import Login from "./components/Login";
// import { useDispatch, useSelector } from "react-redux"
// import { Dispatch, rootSlice, State } from "../../../redux"

const Default: React.FC<any> = () => {
  // const account = useSelector<State>(state => state.account)
  // const dispatch = useDispatch<Dispatch>()

  // return <div onClick={() => dispatch(rootSlice.actions.increment())}>Test</div>
  return (
    <>
      <Com1 />
      <Com2 />
      <Login />
    </>
  )
};

export default Default;
