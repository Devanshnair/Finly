export const portfolioKeys = {
  all: ["portfolio"] as const,
  summary: () => [...portfolioKeys.all, "summary"] as const,
};
