import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGODB_URI);

const email = "abdurraouf@psk-inc.com";

const exists = await User.findOne({ email });

if (exists) {
  console.log("Admin already exists");
  process.exit();
}

const hashedPassword = await bcrypt.hash("Admin123!", 10);

await User.create({
  name: "Abdurraouf Sadi",
  email,
  password: hashedPassword,
  role: "ADMIN",
  isActive: true,
  isDeleted: false,
});

console.log("✅ Admin user seeded");
process.exit();
