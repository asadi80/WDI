import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("waferdb");

  const wafers = await db
    .collection("wafers")
    .find({})
    .sort({ inspectionTime: -1 })
    .toArray();

  return NextResponse.json(wafers);
}
