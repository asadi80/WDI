import mongoose from "mongoose";

const WaferSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    lot: String,
    slotId: Number,
    week: Number,

    chamber: String,
    parentEntity: String,

    inspectionTime: Date,
    spcDataId: String
  },
  { timestamps: true }
);

export default mongoose.models.Wafer ||
  mongoose.model("Wafer", WaferSchema);
