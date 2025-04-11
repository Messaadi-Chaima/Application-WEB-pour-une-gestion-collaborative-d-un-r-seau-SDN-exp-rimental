import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './userSlice';
import { composeWithDevTools } from 'redux-devtools-extension';

export const store = configureStore({
  reducer: {
    users: usersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(), // Redux Toolkit automatically includes thunk
  devTools: process.env.NODE_ENV !== 'production',
});