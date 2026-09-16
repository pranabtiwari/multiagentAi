import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "converstions",
  initialState: {
    conversation: [],
  },
  reducers: {
    setConverstions: (state, action) => {
      state.conversation = action.payload;
    },
    addConversation: (state, action) => {
      state.conversation.unshift = action.payload
    }
  },
});

export const { setConverstions, addConversation } = conversationSlice.actions;
export default conversationSlice.reducer;

