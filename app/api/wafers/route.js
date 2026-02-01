import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";


export async function GET(req) {
   /* 🔐 Verify token */
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = auth.split(" ")[1];

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  const client = await clientPromise;
  const db = client.db("waferdb");

  const wafers = await db
    .collection("wafers")
    .find({})
    .sort({ inspectionTime: -1 })
    .toArray();

  return NextResponse.json(wafers);
}
