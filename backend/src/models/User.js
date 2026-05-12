import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombres: {
      type: String,
      required: true,
      trim: true,
    },

    primerapellido: {
      type: String,
      trim: true,
      default: "",
    },

    segundoapellido: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    telefono: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      default: null, // 🔥 IMPORTANTE para OAuth
    },

    proveedor: {
      type: String,
      default: "credentials",
    },

    // 🔐 Verificación
    verified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
    },

    verificationExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);

