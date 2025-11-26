import { NextResponse } from "next/server";
import { selectDailyCategory } from "../../../../lib/daily-category";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  console.log("[CRON] select-daily-category endpoint called");
  console.log("[CRON] Request headers:", {
    authorization: request.headers.get("authorization") ? "present" : "missing",
    userAgent: request.headers.get("user-agent"),
  });

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  console.log("[CRON] Auth check:", {
    hasAuthHeader: !!authHeader,
    hasCronSecret: !!process.env.CRON_SECRET,
    authMatches: authHeader === expectedAuth,
  });

  if (authHeader !== expectedAuth) {
    console.error("[CRON] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON] Environment check:", {
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasAdminDatabaseUrl: !!process.env.ADMIN_DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
    adminDatabaseUrlPrefix: process.env.ADMIN_DATABASE_URL?.substring(0, 30) + "...",
  });

  try {
    console.log("[CRON] Starting selectDailyCategory");
    const slug = await selectDailyCategory();
    console.log("[CRON] Successfully selected daily category:", slug);
    return NextResponse.json({
      success: true,
      slug,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error selecting daily category:", error);
    console.error("[CRON] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.errorCode,
      clientVersion: (error as any)?.clientVersion,
    });
    return NextResponse.json(
      {
        error: "Failed to select daily category",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
