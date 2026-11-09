import { describe, expect, it } from "vitest";
import {
  fromStroops,
  MAX_STROOPS,
  StellarAmountError,
  toStroops,
} from "../src/index.js";

describe("conversion", () => {
  it.each([
    ["1", 10_000_000n],
    ["1.", 10_000_000n],
    [".5", 5_000_000n],
    ["0.0000001", 1n],
    ["922337203685.4775807", MAX_STROOPS],
    [0.1, 1_000_000n],
    [1e-7, 1n],
    [1n, 10_000_000n],
  ])("converts %s to stroops", (input, expected) => {
    expect(toStroops(input)).toBe(expected);
  });

  it.each([
    "",
    " 1",
    "1 ",
    "1.2.3",
    "1e-7",
    "1a",
    "-1",
    "1.00000001",
    "922337203685.4775808",
  ])("rejects invalid amount %s", (input) => {
    expect(() => toStroops(input)).toThrow(StellarAmountError);
  });

  it.each([
    ["1.00000005", "truncate", 10_000_000n],
    ["1.00000005", "floor", 10_000_000n],
    ["1.00000005", "ceil", 10_000_001n],
    ["1.00000005", "round", 10_000_001n],
    ["1.00000004", "round", 10_000_000n],
  ] as const)("rounds %s using %s", (value, rounding, result) => {
    expect(toStroops(value, { rounding })).toBe(result);
  });

  it("round trips canonical stroops text", () => {
    expect(fromStroops(MAX_STROOPS)).toBe("922337203685.4775807");
    expect(fromStroops("10000000")).toBe("1");
    expect(fromStroops(1)).toBe("0.0000001");
    expect(fromStroops(0n)).toBe("0");
  });

  it.each([-1n, MAX_STROOPS + 1n])(
    "rejects out-of-range stroops %s",
    (value) => {
      expect(() => fromStroops(value)).toThrow(StellarAmountError);
    },
  );

  it("rejects unsafe or invalid stroops inputs", () => {
    expect(() => fromStroops(Number.MAX_SAFE_INTEGER + 1)).toThrowError(
      /safe integer/,
    );
    expect(() => fromStroops("1.0")).toThrowError(/unsigned integer/);
    expect(() => fromStroops("-1")).toThrowError(/Negative/);
    expect(() => fromStroops("invalid")).toThrowError(/unsigned integer/);
    expect(() => toStroops(-1)).toThrowError(StellarAmountError);
    expect(() => toStroops(-1n)).toThrowError(StellarAmountError);
    expect(() => toStroops(1e21)).toThrowError(/int64/);
    expect(() => toStroops(Infinity)).toThrowError(StellarAmountError);
    expect(() => toStroops(922_337_203_686n)).toThrowError(StellarAmountError);
  });
});
