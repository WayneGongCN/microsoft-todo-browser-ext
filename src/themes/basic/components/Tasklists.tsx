import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../redux";
import { backgroundContext } from "../../../popup";

const { tasklistSlice } = backgroundContext;

const Tasklists: React.FC<any> = () => {
  const dispatch = useDispatch();
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  const tasks = useSelector((state: State) => state.task.tasks);
  const account = useSelector(
    (state: State) => state.auth.authenticationResult?.account
  );

  useEffect(() => {
    if (account) {
      console.log('getTasklist ...')
      dispatch(tasklistSlice.getTasklist());
    }
  }, [account]);

  const handleTasklistClick = useCallback(
    (tasklist) => {
      dispatch(tasklistSlice.getTasksByTasklistId(tasklist.id));
    },
    [dispatch]
  );

  return (
    <ul>
      {tasklists.map((tasklist) => (
        <li key={tasklist.id} onClick={() => handleTasklistClick(tasklist)}>
          <b>{tasklist.displayName}</b>
          <ul>
            {tasks
              .filter((task) => (task as any).tasklistId === tasklist.id)
              .map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default Tasklists;
