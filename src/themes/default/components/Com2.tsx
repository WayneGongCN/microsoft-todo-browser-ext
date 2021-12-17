import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backgroundContext } from "../../../popup";
import { State } from "../../../redux";

export const Com2: React.FC<any> = () => {
  const dispatch = useDispatch();
  const handleGetTasklist = useCallback(() => {
    dispatch(backgroundContext.appSlice.getTasklist());
  }, []);

  const firstTaskId = useSelector<State>((s) => s.app.tasklist?.[0]?.id) as string;
  const handleCreateTask = useCallback(() => {
    if (!firstTaskId) return;
    dispatch(
      backgroundContext.appSlice.createTask({
        tasklisId: firstTaskId,
        task: { title: "test task", body: {contentType: "text", content: ""} },
      })
    );
  }, [firstTaskId]);

  return (
    <>
      <div onClick={handleGetTasklist}>getTasklist</div>
      <div onClick={handleCreateTask}>createTask</div>
    </>
  );
};
export default Com2;
