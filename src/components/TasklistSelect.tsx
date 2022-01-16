import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Select, SelectProps } from '@material-ui/core';
import { backgroundContext } from '../helpers/background';
import { State } from '../redux';
import MenuItem from '@material-ui/core/MenuItem';

export default React.forwardRef<unknown, SelectProps>(function TasklistSelect(props: SelectProps, ref) {
  const { tasklistSlice } = backgroundContext;
  const dispatch = useDispatch();
  const loadingTasklist = useSelector((state: State) => state.popup.loadingTasklist);

  // 获取 tasklist
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  useEffect(() => {
    dispatch(tasklistSlice.getTasklist());
  }, []);

  return (
    <>
      <Select disabled={loadingTasklist} ref={ref} {...props} >
        {tasklists.map((x, idx) => (
          <MenuItem id={`com-task-list-${idx}`} key={x.id} value={x.id}>
            {x.displayName}
          </MenuItem>
        ))}
      </Select>
    </>
  );
});
