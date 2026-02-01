import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    /* 🔐 Verify admin */
    const auth = req.headers.get("authorization");
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    /* 📥 Fetch users (exclude sensitive fields) */
    const users = await db
      .collection("users")
      .find(
        { isDeleted: { $ne: true } }, // skip soft-deleted users
        {
          projection: {
            password: 0,
            loginAttempts: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
