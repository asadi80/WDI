import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashed,
          mustChangePassword: false,
        },
      }
    );

    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
