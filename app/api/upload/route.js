import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { parseAndValidateExcel } from "@/lib/parseExcel";
import { computeWaferFeatures } from "@/lib/computeFeatures";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------- helpers -------------------- */

function computeEdxCategory(row: any) {
  const elements = [];

  if (row["CARBON"]) elements.push("C");
  if (row["SILICON"]) elements.push("Si");
  if (row["OXYGEN"]) elements.push("O");
  if (row["NITROGEN"]) elements.push("N");

  return elements.length ? elements.join("+") : "Unknown";
}

/* -------------------- route -------------------- */

export async function POST(req: Request) {
  console.log("🚀 /api/upload called");

  try {
    /* ---------- 1. Read file ---------- */
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📄 File name:", file.name);
    console.log("📦 File size:", file.size);

    const buffer = Buffer.from(await file.arrayBuffer());

    /* ---------- 2. Parse Excel ---------- */
    // TEMP SAFETY LIMIT – remove later if you move off serverless
    const rows = parseAndValidateExcel(buffer).slice(0, 500);

    console.log("📊 Rows parsed:", rows.length);

    /* ---------- 3. MongoDB ---------- */
    const client = await clientPromise;
    const db = client.db("waferdb");

    console.log("🧠 Mongo connected");

    /* ---------- 4. Build wafer map ---------- */
    const wafersMap: Record<
      string,
      { wafer: any; defects: any[] }
    > = {};

    for (const row of rows) {
      const waferId = row["WAFER_ID of CU EDX data"];
      if (!waferId) continue;

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
            createdAt: new Date(),
          },
          defects: [],
        };
      }

      const edxCategory =
        row["EDX_CATEGORY"] || computeEdxCategory(row);

      wafersMap[waferId].defects.push({
        waferId,
        defectId: row["DEFECT_ID of CU EDX data"],
        defectKey: row["DEFECT_KEY"],

        x: Number(row["X"]) || 0,
        y: Number(row["Y"]) || 0,

        defectSize:
          Number(row["DEFECT_SIZE of CU EDX data"]) || null,
        imageCount:
          Number(row["IMAGE_COUNT of CU EDX data"]) || 0,

        edxCategory,

        elements: {
          carbon: row["CARBON"] ?? null,
          nitrogen: row["NITROGEN"] ?? null,
          silicon: row["SILICON"] ?? null,
          oxygen: row["OXYGEN"] ?? null,
        },

        createdAt: new Date(),
      });
    }

    const waferIds = Object.keys(wafersMap);
    console.log("🧩 Wafers found:", waferIds.length);

    /* ---------- 5. Insert wafers (BATCH) ---------- */
    await db.collection("wafers").bulkWrite(
      waferIds.map((waferId) => ({
        updateOne: {
          filter: { waferId },
          update: { $setOnInsert: wafersMap[waferId].wafer },
          upsert: true,
        },
      }))
    );

    /* ---------- 6. Insert defects + features ---------- */
    let defectsInserted = 0;

    for (const waferId of waferIds) {
      const { defects } = wafersMap[waferId];

      if (defects.length) {
        try {
          const res = await db
            .collection("defects")
            .insertMany(defects, { ordered: false });

          defectsInserted += res.insertedCount;
        } catch (e: any) {
          if (e?.code !== 11000) {
            console.error("❌ Defect insert error:", e);
            throw e;
          }
        }
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
    }

    /* ---------- 7. Done ---------- */
    console.log("✅ Upload complete");

    return NextResponse.json({
      status: "success",
      rowsProcessed: rows.length,
      wafersProcessed: waferIds.length,
      defectsInserted,
    });
  } catch (err: any) {
    console.error("❌ UPLOAD ERROR:", err);

    if (err?.message === "Missing required columns") {
      return NextResponse.json(
        {
          error: err.message,
          missingColumns: err.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
