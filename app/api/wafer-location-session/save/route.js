import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    // ✅ native MongoDB connection
    const client = await clientPromise;
    const db = client.db();

    const body = await req.json();

    const {
      waferId,
      lot,
      image,
      selectedModule,
      linkedModules,
      stage,
      moduleType,
      edxCategories,
      plan,
      createdBy,
    } = body;

    if (!image?.data) {
      return NextResponse.json(
        { error: "Image is required" },
        { status: 400 },
      );
    }

    // ✅ Upload image to Cloudinary
    const upload = await cloudinary.uploader.upload(image.data, {
      folder: "wafer-locations",
    });

    // ✅ Build document (schema-like)
    const doc = {
      waferId,
      lot,

      image: {
        source: "cloudinary",
        url: upload.secure_url,
        publicId: upload.public_id,
      },

      selectedModule,
      linkedModules,
      stage,
      moduleType,
      edxCategories,
      plan,
      createdBy,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ Insert using native driver
    const result = await db
      .collection("waferLocationSessions")
      .insertOne(doc);

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      imageUrl: upload.secure_url,
    });
  } catch (err) {
    console.error("Save session error:", err);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 },
    );
  }
}
