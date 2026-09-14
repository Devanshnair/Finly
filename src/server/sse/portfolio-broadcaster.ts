import { EventEmitter } from "events";
import { stockService } from "../services/stock-service";
import { PortfolioSummary } from "@/features/portfolio/types/portfolio.types";

class PortfolioBroadcaster extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private latestSnapshot: PortfolioSummary | null = null;
  private subscriberCount = 0;
  private isTickRunning = false;

  constructor() {
    super();
    // avoid node warning when demoing with many tabs
    this.setMaxListeners(50);
  }

  public getLatest(): PortfolioSummary | null {
    return this.latestSnapshot;
  }

  public subscribe(onUpdate: (data: PortfolioSummary) => void): () => void {
    this.on("portfolio", onUpdate);
    this.subscriberCount++;

    // first tab connected, start the timer
    if (this.subscriberCount === 1) {
      this.startLoop();
    }

    return () => {
      this.off("portfolio", onUpdate);
      this.subscriberCount = Math.max(0, this.subscriberCount - 1);
      // no tabs left, stop wasting cpu
      if (this.subscriberCount === 0) {
        this.stopLoop();
      }
    };
  }

  private startLoop() {
    if (this.timer) return;
    if (!this.latestSnapshot) {
      this.tick();
    }
    this.timer = setInterval(() => {
      this.tick();
    }, 15000);
  }

  private stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async tick() {
    if (this.isTickRunning) return;
    this.isTickRunning = true;
    try {
      const summary = await stockService.getPortfolio();
      this.latestSnapshot = summary;
      this.emit("portfolio", summary);
    } catch (err) {
      console.error("sse tick fail", err);
    } finally {
      this.isTickRunning = false;
    }
  }
}

// keep singleton alive across dev reloads
const globalForBroadcaster = globalThis as unknown as {
  portfolioBroadcaster?: PortfolioBroadcaster;
};

export const portfolioBroadcaster =
  globalForBroadcaster.portfolioBroadcaster ?? new PortfolioBroadcaster();

if (process.env.NODE_ENV !== "production") {
  globalForBroadcaster.portfolioBroadcaster = portfolioBroadcaster;
}
