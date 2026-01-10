import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req, context) {
  const { waferId } = await context.params;

  const client = await clientPromise;
  const db = client.db("waferdb");

  const wafer = await db.collection("wafers").findOne({ waferId });
  if (!wafer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const defects = await db
    .collection("defects")
    .find({ waferId })
    .toArray();

  const features = await db
    .collection("waferFeatures")
    .findOne({ waferId });

  return NextResponse.json({
    wafer,
    defects,
    features,
  });
}
