import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice.js";
import conversationReducer from "./coverstaionSlice.js";

export const store = configureStore({
  reducer: {
    user: userReducer,
    converstions: conversationReducer
  },
});