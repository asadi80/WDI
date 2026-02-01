import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/models/User";

export async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = "abdurraouf@psk-inc.com";

  const exists = await User.findOne({ email });
  if (exists) {
    return { message: "Admin already exists" };
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

  return { message: "✅ Admin user seeded" };
}
