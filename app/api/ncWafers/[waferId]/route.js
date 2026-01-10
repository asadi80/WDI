import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req, context) {
  try {
    // 🔑 params is async in Next 15
    const { waferId } = await context.params;

    const client = await clientPromise;
    const db = client.db("waferdb");

    const wafer = await db
      .collection("nc_wafers")
      .findOne({ waferId });

    if (!wafer) {
      return NextResponse.json(
        { error: "NC wafer not found" },
        { status: 404 }
      );
    }

    const defects = await db
      .collection("nc_defects")
      .find({ waferId })
      .toArray();

    return NextResponse.json({
      wafer: {
        waferId: wafer.waferId,
        lot: wafer.lot,
        slotId: wafer.slotId,
        week: wafer.week,
        chamber: wafer.chamber,
        parentEntity: wafer.parentEntity,
        inspectionTime: wafer.inspectionTime,
        spcDataId: wafer.spcDataId
      },
      defects
    });

  } catch (err) {
    console.error("NC wafer fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch NC wafer" },
      { status: 500 }
    );
  }
}
