import mongoose from "mongoose";

const DefectSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      index: true
    },

    defectId: Number,

    defectKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },

    defectSize: Number,
    imageCount: Number,

    elements: {
      carbon: Number,
      nitrogen: Number,
      silicon: Number
    }
  },
  { timestamps: true }
);

export default mongoose.models.Defect ||
  mongoose.model("Defect", DefectSchema);
