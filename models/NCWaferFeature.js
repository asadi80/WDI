import mongoose from "mongoose";

const NCWaferFeatureSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      unique: true
    },

    defectCount: Number,

    avgDefectSize: Number,
    maxDefectSize: Number,

    avgOxygen: Number,
    avgSilicon: Number,

    edgeDefectRatio: Number,
    centerDefectRatio: Number
  },
  { timestamps: true }
);

export default mongoose.models.NCWaferFeature ||
  mongoose.model("NCWaferFeature", NCWaferFeatureSchema);
