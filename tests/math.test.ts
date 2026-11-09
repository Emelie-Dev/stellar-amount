import { describe, expect, it } from "vitest";
import {
  add,
  compare,
  div,
  MAX_STROOPS,
  max,
  min,
  mul,
  percent,
  StellarAmountError,
  sub,
} from "../src/index.js";

describe("arithmetic", () => {
  it("adds, subtracts, compares, and finds extrema", () => {
    expect(add(2n, 3n)).toBe(5n);
    expect(sub(5n, 3n)).toBe(2n);
    expect(compare(1n, 2n)).toBe(-1);
    expect(compare(2n, 2n)).toBe(0);
    expect(compare(3n, 2n)).toBe(1);
    expect(min(3n, 1n, 2n)).toBe(1n);
    expect(max(3n, 1n, 2n)).toBe(3n);
  });

  it("multiplies, divides, and computes percentages as integers", () => {
    expect(mul(15n, "1.5")).toBe(22n);
    expect(div(15n, "2")).toBe(7n);
    expect(percent(1000n, "2.5")).toBe(25n);
    expect(mul(1n, "1", { rounding: "ceil" })).toBe(1n);
    expect(div(1n, "2", { rounding: "round" })).toBe(1n);
  });

  it("supports all signed rounding directions for rational operations", () => {
    expect(div(5n, "2", { rounding: "floor" })).toBe(2n);
    expect(div(5n, "2", { rounding: "ceil" })).toBe(3n);
    expect(div(5n, "2", { rounding: "truncate" })).toBe(2n);
  });

  it("reports invalid factors, zero division, negative results, and overflow", () => {
    expect(() => sub(1n, 2n)).toThrowError(StellarAmountError);
    expect(() => add(MAX_STROOPS, 1n)).toThrowError(/int64/);
    expect(() => mul(1n, "x")).toThrowError(/decimal/);
    expect(() => mul(-1n, "1")).toThrowError(StellarAmountError);
    expect(() => div(1n, "0")).toThrowError(/zero/);
    expect(() => min()).toThrowError(/at least one/);
    expect(() => max(MAX_STROOPS + 1n)).toThrowError(/int64/);
  });
});
