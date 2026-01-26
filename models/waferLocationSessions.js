import mongoose from "mongoose";

const WaferLocationSessionSchema = new mongoose.Schema(
  {
    waferId: String,
    lot: String,

    image: {
      source: { type: String, default: "cloudinary" },
      url: { type: String, required: true },       // ✅ Cloudinary URL
      publicId: { type: String },                   // ✅ for delete/update later
    },

    selectedModule: String,
    linkedModules: [String],
    stage: String,
    moduleType: String,

    edxCategories: [String],
    plan: String,

    createdBy: String,
  },
  { timestamps: true },
);

export default mongoose.models.WaferLocationSession ||
  mongoose.model("WaferLocationSession", WaferLocationSessionSchema);
