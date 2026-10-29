import { configureStore } from '@reduxjs/toolkit';
import investigationReducer from './investigationSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    investigations: investigationReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
