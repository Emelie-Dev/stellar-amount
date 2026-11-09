import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { add, div, fromStroops, mul, sub, toStroops } from "../src/index.js";

const stroops = fc.bigInt({ min: 0n, max: 1_000_000_000_000n });
const decimalAmounts = fc
  .tuple(
    fc.bigInt({ min: 0n, max: 100_000n }),
    fc.array(fc.integer({ min: 0, max: 9 }), { maxLength: 7 }),
  )
  .map(([whole, digits]) => ({
    value: digits.length ? `${whole}.${digits.join("")}` : whole.toString(),
    canonicalFraction: digits.join("").replace(/0+$/, ""),
    whole: whole.toString(),
  }));

describe("properties", () => {
  it("canonicalizes valid decimal amounts through conversion", () => {
    fc.assert(
      fc.property(decimalAmounts, ({ value, canonicalFraction, whole }) => {
        const canonical = canonicalFraction
          ? `${whole}.${canonicalFraction}`
          : whole;
        expect(fromStroops(toStroops(value))).toBe(canonical);
      }),
    );
  });

  it("add and sub are inverses when the sum is in range", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 0n, max: 500_000_000n }),
        fc.bigInt({ min: 0n, max: 500_000_000n }),
        (a, b) => {
          expect(sub(add(a, b), b)).toBe(a);
        },
      ),
    );
  });

  it("multiplication by one preserves stroops", () => {
    fc.assert(
      fc.property(stroops, (value) => {
        expect(mul(value, "1")).toBe(value);
      }),
    );
  });

  it("division after multiplication remains within one stroop", () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 1n, max: 1_000_000_000n }),
        fc.integer({ min: 1, max: 100 }),
        (value, factor) => {
          const text = `${factor}.25`;
          const product = mul(value, text);
          expect(div(product, text) - value).toBeLessThanOrEqual(1n);
          expect(value - div(product, text)).toBeLessThanOrEqual(1n);
        },
      ),
    );
  });
});
