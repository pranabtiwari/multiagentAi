import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fireBaseId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    avatar: {
        type: String,
    }
},{timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;