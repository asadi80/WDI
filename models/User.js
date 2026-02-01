import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    /* Basic Info */
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* Access Control */
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },


    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* Auth */
    lastLoginAt: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    /* Audit */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* Optional Profile */
    phone: String,
    avatar: String,
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
