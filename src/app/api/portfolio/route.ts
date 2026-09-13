import { NextResponse } from "next/server";
import { stockService } from "@/server/services/stock-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portfolio = await stockService.getPortfolio();

    return NextResponse.json(
      {
        success: true,
        data: portfolio,
        meta: {
          fetchedAt: new Date().toISOString(),
          refreshIntervalSeconds: 15,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[Portfolio API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch portfolio data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
