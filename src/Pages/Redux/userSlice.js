import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.push(action.payload);
    },
    editUser: (state, action) => {
      const { id, name,role,password } = action.payload;
      const existingUser = state.find(user => user.id === id);
      if(existingUser) {
        existingUser.name = name;
        existingUser.role = role;
        existingUser.password = password;
      }
    },
    editRole: (state, action) => {
      const { id,role } = action.payload;
      const existingUser = state.find(user => user.id === id);
      if(existingUser) {
        existingUser.role = role;
      }
    },
    deleteUser: (state, action) => {
      const { id } = action.payload;
      const existingUser = state.find(user => user.id === id);
      if(existingUser) {
        return state.filter(user => user.id !== id);
      }
    }
  }
});

export const { addUser, editUser,deleteUser,editRole } = userSlice.actions;
export default userSlice.reducer;