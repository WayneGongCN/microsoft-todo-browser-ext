// TODO: refactor with React Final Form
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const initialState = {
  popupformAutoClear: true,
};

function configReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export default persistReducer({ key: 'config', storage }, configReducer);
