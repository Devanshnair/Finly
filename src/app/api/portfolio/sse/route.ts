import { NextRequest } from "next/server";
import { portfolioBroadcaster } from "@/server/sse/portfolio-broadcaster";

// node runtime needed for persistent interval and eventemitter
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // send latest snapshot immediately so tab does not wait 15s
      const latest = portfolioBroadcaster.getLatest();
      if (latest) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(latest)}\n\n`));
      } else {
        portfolioBroadcaster.tick().then(() => {
          const fresh = portfolioBroadcaster.getLatest();
          if (fresh) {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(fresh)}\n\n`));
            } catch {
              // tab closed early
            }
          }
        });
      }

      const unsubscribe = portfolioBroadcaster.subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      req.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
