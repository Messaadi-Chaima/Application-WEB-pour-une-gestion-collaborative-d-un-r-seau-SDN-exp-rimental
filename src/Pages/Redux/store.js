import { configureStore } from '@reduxjs/toolkit'
import usersReducer from './userSlice'
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyMiddleware } from "redux"
import {thunk} from 'redux-thunk';
const middleware = [thunk];
export const store = configureStore({
  reducer: {
    users: usersReducer
  },
  
}, composeWithDevTools(
  applyMiddleware(...middleware)))