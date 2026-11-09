import { MAX_STROOPS } from "./constants.js";
import { StellarAmountError } from "./errors.js";
import {
  decimalToRational,
  divideRounded,
  validateRoundingMode,
  type RoundingMode,
} from "./rounding.js";

function assertAmount(value: bigint): void {
  if (value < 0n)
    throw new StellarAmountError(
      "NEGATIVE",
      "Negative values are not supported.",
    );
  if (value > MAX_STROOPS)
    throw new StellarAmountError(
      "OVERFLOW",
      "Amount exceeds the int64 stroops limit.",
    );
}

function checked(value: bigint): bigint {
  assertAmount(value);
  return value;
}

function factorRational(value: string): { numerator: bigint; scale: bigint } {
  return decimalToRational(value);
}

export function add(a: bigint, b: bigint): bigint {
  assertAmount(a);
  assertAmount(b);
  return checked(a + b);
}

export function sub(a: bigint, b: bigint): bigint {
  assertAmount(a);
  assertAmount(b);
  return checked(a - b);
}

export function mul(
  a: bigint,
  factor: string,
  opts?: { rounding?: RoundingMode },
): bigint {
  assertAmount(a);
  const { numerator, scale } = factorRational(factor);
  return checked(
    divideRounded(a * numerator, scale, validateRoundingMode(opts?.rounding)),
  );
}

export function div(
  a: bigint,
  divisor: string,
  opts?: { rounding?: RoundingMode },
): bigint {
  assertAmount(a);
  const { numerator, scale } = factorRational(divisor);
  if (numerator === 0n)
    throw new StellarAmountError("DIVIDE_BY_ZERO", "Cannot divide by zero.");
  return checked(
    divideRounded(a * scale, numerator, validateRoundingMode(opts?.rounding)),
  );
}

export function percent(
  a: bigint,
  pct: string,
  opts?: { rounding?: RoundingMode },
): bigint {
  assertAmount(a);
  const { numerator, scale } = factorRational(pct);
  return checked(
    divideRounded(
      a * numerator,
      scale * 100n,
      validateRoundingMode(opts?.rounding),
    ),
  );
}

export function compare(a: bigint, b: bigint): -1 | 0 | 1 {
  assertAmount(a);
  assertAmount(b);
  return a < b ? -1 : a > b ? 1 : 0;
}

function extrema(values: bigint[], operation: "min" | "max"): bigint {
  if (values.length === 0)
    throw new StellarAmountError(
      "INVALID_FORMAT",
      `${operation} requires at least one value.`,
    );
  for (const value of values) assertAmount(value);
  return values.reduce((best, value) =>
    operation === "min"
      ? value < best
        ? value
        : best
      : value > best
        ? value
        : best,
  );
}

export function min(...values: bigint[]): bigint {
  return extrema(values, "min");
}

export function max(...values: bigint[]): bigint {
  return extrema(values, "max");
}
