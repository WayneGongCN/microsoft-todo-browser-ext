import React, { forwardRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { State } from '../redux';
import MenuItem from '@mui/material/MenuItem';
import { fetchTasklistAction } from '../redux/tasklist';


interface TasklistSelectProps {
  defaultIdx?: number;
}

const mapState = (state: State) => {
  const { auth, tasklist } = state
  return {
    loadingTasklist: tasklist.loading,
    account: auth.authenticationResult?.account,
    tasklists: tasklist.lists
  }
}


const TasklistSelect = ({ defaultIdx = null, ...props }: TextFieldProps & TasklistSelectProps, ref: React.Ref<HTMLDivElement>) => {
  const dispatch = useDispatch();
  const { loadingTasklist, account, tasklists } = useSelector(mapState);


  const updateTasklist = () => dispatch(fetchTasklistAction())
  useEffect(() => {
    if (!tasklists.length && account) updateTasklist()
  }, [tasklists, account]);


  useEffect(() => {
    if (defaultIdx !== null && !props.value && tasklists.length) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      props.onChange(tasklists[defaultIdx]?.id || '')
    }
  }, [tasklists, props])

  return (
    <>
      <TextField ref={ref} select disabled={loadingTasklist || !account} {...props} style={{ minWidth: '10em', ...props.style }}>
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
