import { NextResponse } from "next/server";
import XLSX from "xlsx";
import clientPromise from "@/lib/mongodb";
import { parseAndValidateExcel } from "@/lib/parseExcel";
import { computeWaferFeatures } from "@/lib/computeFeatures";

export const runtime = "nodejs";

function computeEdxCategory(row) {
  const elements = [];

  if (row["CARBON"]) elements.push("C");
  if (row["SILICON"]) elements.push("Si");
  if (row["OXYGEN"]) elements.push("O");
  if (row["NITROGEN"]) elements.push("N");

  return elements.length ? elements.join("+") : "Unknown";
}

export async function POST(req) {
  console.log("📥 /api/upload called");

  try {
    // 1️⃣ Read file
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 2️⃣ Parse Excel
    const rows = parseAndValidateExcel(buffer);

    // 3️⃣ MongoDB
    const client = await clientPromise;
    const db = client.db("waferdb");

    const wafersMap = {};

    rows.forEach((row) => {
      const waferId = row["WAFER_ID of CU EDX data"];
      if (!waferId) return;

      if (!wafersMap[waferId]) {
        wafersMap[waferId] = {
          wafer: {
            waferId,
            lot: row["LOT"],
            slotId: row["SLOT_ID of CU EDX data"],
            week: row["DATA_COLLECTION_WW"],
            chamber: row["CHAMBER_INFO"],
            parentEntity: row["PARENT_ENTITY"],
            inspectionTime: new Date(row["EDX_INSPECTION_DATETIME"]),
            spcDataId: row["SPC_DATA_ID"],
          },
          defects: [],
        };
      }

      const edxCategory = row["EDX_CATEGORY"] || computeEdxCategory(row);

      wafersMap[waferId].defects.push({
        waferId,
        defectId: row["DEFECT_ID of CU EDX data"],
        defectKey: row["DEFECT_KEY"],

        x: Number(row["X"]) || 0,
        y: Number(row["Y"]) || 0,

        defectSize: Number(row["DEFECT_SIZE of CU EDX data"]) || null,
        imageCount: Number(row["IMAGE_COUNT of CU EDX data"]) || 0,

        edxCategory,

        elements: {
          carbon: row["CARBON"] ?? null,
          nitrogen: row["NITROGEN"] ?? null,
          silicon: row["SILICON"] ?? null,
          oxygen: row["OXYGEN"] ?? null,
        },

        createdAt: new Date(),
      });
    });

    // 4️⃣ Insert data
    let wafersInserted = 0;
    let defectsInserted = 0;

    for (const waferId in wafersMap) {
      const { wafer, defects } = wafersMap[waferId];

      await db
        .collection("wafers")
        .updateOne({ waferId }, { $setOnInsert: wafer }, { upsert: true });

      try {
        const res = await db.collection("defects").insertMany(defects, {
          ordered: false,
        });
        defectsInserted += res.insertedCount;
      } catch (e) {
        if (e.code !== 11000) throw e;
      }

      const features = computeWaferFeatures(defects);

      await db.collection("waferFeatures").updateOne(
        { waferId },
        {
          $set: {
            waferId,
            ...features,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      wafersInserted++;
    }

    return NextResponse.json({
      status: "success",
      rows: rows.length,
      wafersProcessed: wafersInserted,
      defectsProcessed: defectsInserted,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    if (err.message === "Missing required columns") {
      return NextResponse.json(
        {
          error: err.message,
          missingColumns: err.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
