import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../feature/user/userSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});