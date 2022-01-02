import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../../../redux';
import { backgroundContext } from '../../../popup';

const { taskSlice } = backgroundContext;

const Tasks: React.FC<any> = ({ tasklistId }) => {
  const dispatch = useDispatch();
  const tasklists = useSelector((state: State) => state.task.tasks);

  useEffect(() => {
    // dispatch(taskSlice.get())
  }, []);

  return (
    <ul>
      {
        // tasklists.map(x => <li key={x.id}>{x.displayName}</li>)
      }
    </ul>
  );
};

export default Tasks;
