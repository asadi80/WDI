import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // 1️⃣ MongoDB (same as CU & NC upload)
    const client = await clientPromise;
    const db = client.db("waferdb");

    // 2️⃣ Fetch NC wafers
    const wafers = await db
      .collection("nc_wafers")
      .find({})
      .sort({ inspectionTime: -1 })
      .toArray();

    if (!wafers.length) {
      return NextResponse.json([]);
    }

    // 3️⃣ Aggregate defect counts
    const defectCounts = await db
      .collection("nc_defects")
      .aggregate([
        {
          $group: {
            _id: "$waferId",
            count: { $sum: 1 }
          }
        }
      ])
      .toArray();

    const defectMap = {};
    defectCounts.forEach(d => {
      defectMap[d._id] = d.count;
    });

    // 4️⃣ Attach defectCount
    const result = wafers.map(w => ({
      waferId: w.waferId,
      lot: w.lot,
      slotId: w.slotId,
      chamber: w.chamber,
      inspectionTime: w.inspectionTime,
      defectCount: defectMap[w.waferId] || 0
    }));

    return NextResponse.json(result);

  } catch (err) {
    console.error("NC wafers fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch NC wafers" },
      { status: 500 }
    );
  }
}
