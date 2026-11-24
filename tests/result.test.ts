import { describe, expect, it } from "vitest";
import {
  isFailure,
  isSuccess,
  MAX_STROOPS,
  toStroops,
  tryToStroops,
  StellarAmountError,
} from "../src/index.js";

describe("tryToStroops", () => {
  it("returns the exact stroops for a valid amount", () => {
    const result = tryToStroops("12.3456789");
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected success");
    expect(result.stroops).toBe(123456789n);
  });

  it("accepts bigint input and multiplies by STROOPS_PER_UNIT", () => {
    const result = tryToStroops(5n);
    expect(result).toEqual({ ok: true, stroops: 50000000n });
  });

  it("accepts number input", () => {
    const result = tryToStroops(1.5);
    expect(result.ok && result.stroops).toBe(15000000n);
  });

  it("forwards the rounding option", () => {
    const result = tryToStroops("0.00000001", { rounding: "round" });
    expect(result.ok && result.stroops).toBe(0n);
  });

  it("reports INVALID_FORMAT for junk input", () => {
    const result = tryToStroops("not-a-number");
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.code).toBe("INVALID_FORMAT");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.error).toBeInstanceOf(StellarAmountError);
    expect(result.error.code).toBe("INVALID_FORMAT");
  });

  it("reports INVALID_FORMAT for non-finite numbers", () => {
    const result = tryToStroops(Number.POSITIVE_INFINITY);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.code).toBe("INVALID_FORMAT");
  });

  it("reports TOO_MANY_DECIMALS for more than 7 decimal places", () => {
    const result = tryToStroops("1.12345678");
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.code).toBe("TOO_MANY_DECIMALS");
  });

  it("reports NEGATIVE for negative bigint input", () => {
    const result = tryToStroops(-1n);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.code).toBe("NEGATIVE");
  });

  it("reports OVERFLOW above the int64 stroops limit", () => {
    const result = tryToStroops(MAX_STROOPS / 10000000n + 1n);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.code).toBe("OVERFLOW");
  });

  it("returns exactly the value the throwing API would return", () => {
    for (const sample of ["0", "1", "0.0000001", "922337203685.4775807", "12.3456789"]) {
      const result = tryToStroops(sample);
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error("expected success");
      expect(result.stroops).toBe(toStroops(sample));
    }
  });

  it("agrees with toStroops throwing behavior on invalid input", () => {
    for (const sample of ["", " ", "1e", "1,000", "-0.1", "1.12345678", "1.e5", "+1"]) {
      const result = tryToStroops(sample);
      expect(result.ok).toBe(false);
      expect(() => toStroops(sample)).toThrow(StellarAmountError);
    }
  });

  it("narrows with isSuccess and isFailure", () => {
    const good = tryToStroops("1");
    const bad = tryToStroops("nope");

    expect(isSuccess(good)).toBe(true);
    expect(isFailure(good)).toBe(false);
    expect(isSuccess(bad)).toBe(false);
    expect(isFailure(bad)).toBe(true);

    if (isSuccess(good)) expect(good.stroops).toBe(10000000n);
    if (isFailure(bad)) expect(bad.code).toBe("INVALID_FORMAT");
  });

  it("is exhaustive over the documented error codes it can produce", () => {
    const codes = new Set(
      ["x", "1.12345678", "-1n"].map((input) => {
        const result = tryToStroops(input === "-1n" ? -1n : input);
        return result.ok ? "OK" : result.code;
      }),
    );
    expect(codes).toEqual(new Set(["INVALID_FORMAT", "TOO_MANY_DECIMALS", "NEGATIVE"]));
  });
});
