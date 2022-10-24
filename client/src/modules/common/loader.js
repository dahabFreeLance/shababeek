import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  actions: [],
};

const {
  reducer,
  actions: { addAction, removeAction },
} = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    addAction: (state, { payload }) => {
      state.actions = [...state.actions, payload];
    },
    removeAction: (state, { payload }) => {
      state.actions = state.actions.filter((action) => action !== payload);
    },
  },
});

export { addAction, removeAction };

export default reducer;
