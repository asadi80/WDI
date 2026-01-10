import mongoose from "mongoose";

const WaferFeatureSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    defectCount: Number,
    avgDefectSize: Number,
    maxDefectSize: Number,

    avgCarbon: Number,
    avgSilicon: Number,

    edgeDefectRatio: Number,
    centerDefectRatio: Number
  },
  { timestamps: true }
);

export default mongoose.models.WaferFeature ||
  mongoose.model("WaferFeature", WaferFeatureSchema);
