import { createSlice } from '@reduxjs/toolkit'

const initialState: ISliceAccount = {
  account: null,
  token: null,
  scopes: ['User.Read', 'Tasks.ReadWrite'],
  loggingIn: false
}

const account = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount: {
      reducer(state, action) {
        const { account, token } = action.payload;
        state.account = account;
        state.token = token;
        state.loggingIn = true;
      },
      prepare(accounts) {
        console.log('prepare', accounts);
        return { payload: { account: accounts[0] }, meta: '', error: '' }
      }
    }
  }
})

export const { setAccount } = account.actions
console.log(setAccount)

export default account.reducer
