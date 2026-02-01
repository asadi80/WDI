import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
      const emailRegex = /^[^\s@]+@psk-inc\.com$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Only @psk-inc.com email addresses are allowed" },
      { status: 400 }
    );
  }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 🔐 create JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role, 
        mustChangePassword: user.mustChangePassword, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
         mustChangePassword: user.mustChangePassword, 
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
