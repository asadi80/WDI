import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";


export async function GET(req) {
  try {
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
