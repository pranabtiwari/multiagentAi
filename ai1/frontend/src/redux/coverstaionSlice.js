import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "converstions",
  initialState: {
    conversations: [],
    conversation: [], // Backward compatibility
    activeConversationId: null,
  },
  reducers: {
    setConverstions: (state, action) => {
      const list = Array.isArray(action.payload) ? action.payload : [];
      state.conversations = list;
      state.conversation = list;
      if (!state.activeConversationId && list.length > 0) {
        state.activeConversationId = list[0]._id;
      }
    },
    addConversation: (state, action) => {
      if (action.payload) {
        state.conversations.unshift(action.payload);
        state.conversation.unshift(action.payload);
        state.activeConversationId = action.payload._id;
      }
    },
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload;
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (c) => c._id !== action.payload
      );
      state.conversation = state.conversations;
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = state.conversations[0]?._id || null;
      }
    },
  },
});

export const {
  setConverstions,
  addConversation,
  setActiveConversationId,
  removeConversation,
} = conversationSlice.actions;

export default conversationSlice.reducer;
