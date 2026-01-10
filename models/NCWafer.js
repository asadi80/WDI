import mongoose from "mongoose";

const NCWaferSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      index: true
      // ❗ NOT unique (NC + CU can share waferId)
    },

    lot: String,
    slotId: Number,
    week: Number,

    chamber: String,
    parentEntity: String,

    inspectionTime: Date,
    spcDataId: String,

    // 🔹 Explicitly mark wafer type
    waferType: {
      type: String,
      default: "NC"
    }
  },
  { timestamps: true }
);

export default mongoose.models.NCWafer ||
  mongoose.model("NCWafer", NCWaferSchema);
