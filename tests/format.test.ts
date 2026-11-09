import { describe, expect, it } from "vitest";
import { format, MAX_STROOPS } from "../src/index.js";

describe("format", () => {
  it.each([
    ["en-US", "1,234.5"],
    ["de-DE", "1.234,5"],
    ["fr-FR", "1\u202f234,5"],
    ["en-NG", "1,234.5"],
  ])("formats in %s", (locale, expected) => {
    expect(format(12_345_000_000n, { locale, maxDecimals: 1 })).toBe(expected);
  });

  it("supports symbols, decimal limits, and grouping options", () => {
    expect(format(12_340_000n, { symbol: "XLM", minDecimals: 2 })).toBe(
      "1.234 XLM",
    );
    expect(format(12_340_000n, { minDecimals: 4, maxDecimals: 4 })).toBe(
      "1.2340",
    );
    expect(format(12_340_000n, { groupSeparator: false })).toBe("1.234");
  });

  it.each([
    ["truncate", "1.23"],
    ["floor", "1.23"],
    ["ceil", "1.24"],
    ["round", "1.24"],
  ] as const)("rounds display using %s", (rounding, expected) => {
    expect(format(12_356_789n, { maxDecimals: 2, rounding })).toBe(expected);
  });

  it("handles zero and maximum values", () => {
    expect(format(0n, { minDecimals: 2 })).toBe("0.00");
    expect(format(MAX_STROOPS)).toBe("922,337,203,685.4775807");
  });

  it("rejects invalid values and decimal options", () => {
    expect(() => format(-1n)).toThrowError(/Negative/);
    expect(() => format(MAX_STROOPS + 1n)).toThrowError(/int64/);
    expect(() => format(1n, { minDecimals: 3, maxDecimals: 2 })).toThrowError(
      /Decimal limits/,
    );
    expect(() => format(1n, { locale: "not_a_locale" })).toThrowError(
      /Invalid locale/,
    );
  });
});
