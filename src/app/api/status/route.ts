import { NextResponse } from "next/server";

/**
 * Sample API Route
 * Demonstrates how to handle backend logic within the Next.js app.
 */
export async function GET() {
  return NextResponse.json({
    status: "online",
    version: "1.0.0",
    message: "Attriscope API is operational",
    timestamp: new Date().toISOString()
  });
}
