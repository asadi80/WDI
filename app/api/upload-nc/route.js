// app/api/upload-nc/route.js
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import clientPromise from "@/lib/mongodb";
import { parseExcelNC } from "@/lib/parseExcelNC";
export const runtime = "nodejs";

export async function POST(req) {
    console.log("🚀 NC upload started");
  try {
    // 1️⃣ MongoDB (same as CU)
    const client = await clientPromise;
    const db = client.db("waferdb");

    // 2️⃣ Read file
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3️⃣ Parse + validate NC Excel
    const rows = parseExcelNC(buffer);

    let waferCount = 0;
    let defectCount = 0;

    for (const row of rows) {
      const waferId = row["WAFER_ID of NC EDX data"];
      if (!waferId) continue;

      // ===== UPSERT NC WAFER =====
      await db.collection("nc_wafers").updateOne(
        { waferId },
        {
          $setOnInsert: {
            waferId,
            lot: row["LOT"],
            slotId: row["SLOT_ID of NC EDX data"],
            week: row["DATA_COLLECTION_WW"],
            chamber: row["CHAMBER_INFO"],
            parentEntity: row["PARENT_ENTITY"],
            inspectionTime: new Date(row["NC_EDX_INSPECTION_DATETIME"]),
            spcDataId: row["ENTITY of NC EDX data"],
            type: "NC"
          }
        },
        { upsert: true }
      );

      // ===== INSERT NC DEFECT =====
      const defectKey = `${waferId}_${row["X"]}_${row["Y"]}_${row["DEFECT_SIZE of NC EDX data"]}`;

      await db.collection("nc_defects").updateOne(
        { defectKey },
        {
          $setOnInsert: {
            waferId,
            defectKey,
            x: row["X"],
            y: row["Y"],
            defectSize: row["DEFECT_SIZE of NC EDX data"],
            edxCategory: row["EDX_CATEGORY"] || "Unknown",

            elements: {
              carbon: row["CARBON"],
              nitrogen: row["NITROGEN"],
              silicon: row["SILICON"],
              oxygen: row["OXYGEN"],
              titanium: row["TITANIUM"],
              copper: row["COPPER"],
              aluminum: row["ALUMINIUM"],
              tungsten: row["TUNGSTEN"],
              iron: row["IRON"],
              nickel: row["NICKEL"],
              cobalt: row["COBALT"]
            },

            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      defectCount++;
    }

    waferCount = await db.collection("nc_wafers").countDocuments();
    console.log("✅ NC upload finished");
    return NextResponse.json({
      wafers: waferCount,
      defects: defectCount
    });

  } catch (err) {
    console.error("NC UPLOAD ERROR:", err);

    return NextResponse.json(
      {
        error: err.message,
        details: err.details || null
      },
      { status: 500 }
    );
  }
}
