import { NextResponse } from "next/server";
import { stockService } from "@/server/services/stock-service";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const portfolio = await stockService.getAssignmentSpecPortfolio();

    return NextResponse.json(
      {
        success: true,
        data: portfolio,
        meta: {
          fetchedAt: new Date().toISOString(),
          refreshIntervalSeconds: 30,
          mode: "assignment-spec",
          sources: {
            cmp: "Yahoo Finance (yahoo-finance2 batch)",
            pe: "Google Finance (live HTML quote scrape)",
            earnings: "Yahoo Finance",
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[Assignment-Spec Portfolio API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Failed to fetch dual-source portfolio data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
