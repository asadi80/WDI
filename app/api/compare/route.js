import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { parseAndValidateExcel } from "@/lib/parseExcel";
import { computeWaferFeatures } from "@/lib/computeFeatures";
import { computeSimilarity } from "@/lib/similarity";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1️⃣ Parse Excel
    const rows = parseAndValidateExcel(buffer);

    // 2️⃣ Group defects by wafer
    const wafers = {};
    for (const row of rows) {
      const waferId = row["WAFER_ID of CU EDX data"];
      if (!wafers[waferId]) wafers[waferId] = [];
      wafers[waferId].push({
        x: row.X,
        y: row.Y,
        defectSize: row["DEFECT_SIZE of CU EDX data"],
        elements: {
          C: row.CARBON ?? 0,
          N: row.NITROGEN ?? 0,
          Si: row.SILICON ?? 0
        }
      });
    }

    // 3️⃣ Load reference features
    const client = await clientPromise;
    const db = client.db("waferdb");

    const referenceFeatures = await db
      .collection("waferFeatures")
      .find({ reference: true })
      .toArray();

    if (referenceFeatures.length === 0) {
      return NextResponse.json(
        { error: "No reference wafers in DB" },
        { status: 400 }
      );
    }

    // 4️⃣ Compare each wafer
    const results = [];

    for (const waferId in wafers) {
      const defects = wafers[waferId];

      const features = computeWaferFeatures(defects);
      const similarity = computeSimilarity(features, referenceFeatures);

      results.push({
        waferId,
        features,
        similarity,
        alert: similarity.alert,
        defects
      });
    }

    return NextResponse.json({
      wafersCompared: results.length,
      results
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Compare failed" },
      { status: 500 }
    );
  }
}
