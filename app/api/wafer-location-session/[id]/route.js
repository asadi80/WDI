import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  try {
    // ✅ IMPORTANT FIX
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const session = await db
      .collection("waferLocationSessions")
      .findOne({ _id: new ObjectId(id) });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("GET wafer-location-session error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE session by ID
========================= */
export async function DELETE(request, { params }) {
  try {
     const { id } = await params;


    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const result = await db
      .collection("waferLocationSessions")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Session deleted successfully",
      id,
    });
  } catch (err) {
    console.error("DELETE wafer-location-session error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

