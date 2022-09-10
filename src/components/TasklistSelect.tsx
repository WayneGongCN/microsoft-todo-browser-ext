import React, { forwardRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { State } from '../redux';
import MenuItem from '@mui/material/MenuItem';
import { fetchTasklistAction } from '../redux/tasklist';



const TasklistSelect = (props: TextFieldProps, ref: React.Ref<HTMLDivElement>) => {
  const dispatch = useDispatch();
  const loadingTasklist = useSelector((state: State) => state.popup.loadingTasklist);
  const account = useSelector((state: State) => state.auth.authenticationResult?.account);

  // 获取 tasklist
  const tasklists = useSelector((state: State) => state.tasklist.lists);
  useEffect(() => {
    account && dispatch(fetchTasklistAction());
  }, [account]);

  return (
    <>
      <TextField ref={ref} select disabled={loadingTasklist || !account} {...props}>
        {tasklists.map((x, idx) => (
          <MenuItem id={`com-task-list-${idx}`} key={x.id} value={x.id}>
            {x.displayName}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default forwardRef(TasklistSelect);
