import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { State } from '../redux';
import MenuItem from '@mui/material/MenuItem';
import { fetchTasklist } from '../redux/tasklist';

const TasklistSelect = ({ ref, ...props }: TextFieldProps) => {
  console.log('TasklistSelect props: ', props);
  const dispatch = useDispatch();
  const loadingTasklist = useSelector((state: State) => state.popup.loadingTasklist);
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  // 获取 tasklist
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  useEffect(() => {
    account && dispatch(fetchTasklist());
  }, [account]);

  return (
    <>
      <TextField select disabled={loadingTasklist || !account} {...props}>
        {tasklists.map((x, idx) => (
          <MenuItem id={`com-task-list-${idx}`} key={x.id} value={x.id}>
            {x.displayName}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default TasklistSelect;
