import { configureStore } from '@reduxjs/toolkit';

import loader from '../common/loader';

const store = configureStore({
  reducer: {
    loader,
  },
});

export default store;
