import mongoose from "mongoose";

const NCDefectSchema = new mongoose.Schema(
  {
    waferId: {
      type: String,
      required: true,
      index: true
    },

    defectKey: {
      type: String,
      required: true,
      unique: true
    },

    x: Number,
    y: Number,

    defectSize: Number,

    // 🔹 NC still HAS EDX category
    edxCategory: {
      type: String,
      default: "Unknown"
    },

    // 🔹 Full elemental scan (NC-specific)
    elements: {
      carbon: Number,
      nitrogen: Number,
      silicon: Number,
      oxygen: Number,
      titanium: Number,
      copper: Number,
      aluminum: Number,
      tungsten: Number,
      iron: Number,
      nickel: Number,
      cobalt: Number
      // you can extend safely later
    }
  },
  { timestamps: true }
);

export default mongoose.models.NCDefect ||
  mongoose.model("NCDefect", NCDefectSchema);
