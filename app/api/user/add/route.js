import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import User from "@/models/User";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    /* 🔐 Verify admin */
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      const token = auth.split(" ")[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    /* 📥 Request body */
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    /* 📧 Normalize email */
    const normalizedEmail = email.toLowerCase().trim();

    /* 🚫 Check duplicate email */
    const existing = await db
      .collection("users")
      .findOne({ email: normalizedEmail });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    /* 🔐 Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 🛡️ Prevent privilege escalation */
    const safeRole = role === "admin" ? "user" : role || "user";

    /* ✅ Insert user */
    await db.collection("users").insertOne({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
       mustChangePassword: true, // 👈 YOU MUST ADD THIS
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
