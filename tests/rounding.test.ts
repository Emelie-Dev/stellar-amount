import { describe, expect, it } from "vitest";
import {
  decimalToRational,
  divideRounded,
  validateRoundingMode,
} from "../src/rounding.js";

describe("rounding helpers", () => {
  it("validates optional and supported rounding modes", () => {
    expect(validateRoundingMode(undefined)).toBe("truncate");
    expect(validateRoundingMode("floor")).toBe("floor");
    expect(validateRoundingMode("ceil")).toBe("ceil");
    expect(validateRoundingMode("round")).toBe("round");
    expect(validateRoundingMode("truncate")).toBe("truncate");
  });

  it("rounds rational values correctly for signed numerators and denominators", () => {
    expect(divideRounded(-5n, 2n, "floor")).toBe(-3n);
    expect(divideRounded(-5n, 2n, "ceil")).toBe(-2n);
    expect(divideRounded(5n, -2n, "floor")).toBe(-3n);
    expect(divideRounded(5n, -2n, "ceil")).toBe(-2n);
    expect(divideRounded(-5n, 2n, "round")).toBe(-3n);
    expect(divideRounded(-3n, 2n, "round")).toBe(-2n);
    expect(divideRounded(4n, 2n, "round")).toBe(2n);
  });

  it("rejects zero denominators and malformed decimals", () => {
    expect(() => divideRounded(1n, 0n, "round")).toThrow(/zero/);
    expect(decimalToRational(".5")).toEqual({ numerator: 5n, scale: 10n });
    expect(() => decimalToRational("")).toThrow(/whitespace/);
    expect(() => decimalToRational(" 1")).toThrow(/whitespace/);
    expect(() => decimalToRational("-1")).toThrow(/Negative/);
    expect(() => decimalToRational("+1")).toThrow(/decimal/);
  });
});
