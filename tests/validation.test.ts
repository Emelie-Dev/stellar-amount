import { describe, expect, it } from "vitest";
import {
  assertValidAmount,
  isValidAmount,
  StellarAmountError,
  toStroops,
} from "../src/index.js";

describe("validation", () => {
  it.each(["0", ".5", "1.", "12.3456789"])("accepts %s", (value) => {
    expect(isValidAmount(value)).toBe(true);
    expect(() => assertValidAmount(value)).not.toThrow();
  });

  it.each([
    "",
    " 1",
    "1 ",
    "1.2.3",
    "1x",
    "-0",
    "0.00000001",
    "922337203685.4775808",
  ])("rejects %s", (value) => {
    expect(isValidAmount(value)).toBe(false);
    expect(() => assertValidAmount(value)).toThrow(StellarAmountError);
  });

  it("rejects unknown rounding options", () => {
    expect(() =>
      toStroops("1.2", { rounding: "unknown" as never }),
    ).toThrowError(/rounding/);
  });
});
