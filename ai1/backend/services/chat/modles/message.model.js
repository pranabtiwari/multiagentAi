import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: String,
    filename: String,
    content: String,
  },
  {
    _id: false,
  }
);

const artifactSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    title: String,
    description: String,
    language: String,
    dependencies: [String],
    files: [fileSchema],
    runInstructions: [String],
    testInstructions: [String],
  },
  {
    _id: false,
    strict: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    artifacts: [artifactSchema],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;