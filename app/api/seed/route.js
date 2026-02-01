// import { connectDB } from "@/lib/mongodb";
import { seedAdmin } from "@/lib/seedAdmin";

export async function GET() {
  await connectDB();
  const result = await seedAdmin();

  return Response.json(result);
}