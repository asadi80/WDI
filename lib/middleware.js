import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
