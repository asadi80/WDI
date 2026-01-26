import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // uses default DB from URI

    const wafers = await db
      .collection("wafers")
      .aggregate([
        {
          $lookup: {
            from: "defects",
            localField: "waferId",
            foreignField: "waferId",
            as: "defects",
          },
        },
        {
          $addFields: {
            defectCount: { $size: "$defects" },
          },
        },
        {
          $sort: { inspectionTime: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(wafers);
  } catch (error) {
    console.error("Error fetching wafers with defects:", error);
    return NextResponse.json(
      { error: "Failed to fetch wafers with defects" },
      { status: 500 }
    );
  }
}
