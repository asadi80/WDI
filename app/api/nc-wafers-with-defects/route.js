import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // default DB from URI

    const wafers = await db
      .collection("nc_wafers")
      .aggregate([
        {
          $lookup: {
            from: "nc_defects",
            localField: "waferId",
            foreignField: "waferId",
            as: "defects",
          },
        },
        {
          $addFields: {
            defectCount: { $size: "$defects" },

            // collect unique EDX categories
            edx: {
              $setUnion: [
                {
                  $map: {
                    input: "$defects",
                    as: "d",
                    in: { $ifNull: ["$$d.edxCategory", "Unknown"] },
                  },
                },
              ],
            },
          },
        },
        {
          $sort: { inspectionTime: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(wafers);
  } catch (error) {
    console.error("Error fetching NC wafers with defects:", error);
    return NextResponse.json(
      { error: "Failed to fetch NC wafers with defects" },
      { status: 500 }
    );
  }
}
