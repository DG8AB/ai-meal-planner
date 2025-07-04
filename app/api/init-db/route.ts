import { NextResponse } from "next/server"
import { ensureSchema } from "@/lib/edgedb-server"

/**
 * Warm-up endpoint called from the browser once per session.
 * It simply makes sure the EdgeDB schema exists.
 */
export async function GET() {
  try {
    await ensureSchema()
    return NextResponse.json({
      success: true,
      message: "EdgeDB is ready",
    })
  } catch (error) {
    console.error("EdgeDB init error:", error)
    return NextResponse.json({ success: false, error: "EdgeDB init failed", details: String(error) }, { status: 500 })
  }
}
