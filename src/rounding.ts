import { StellarAmountError } from "./errors.js";

export type RoundingMode = "floor" | "ceil" | "round" | "truncate";

export function validateRoundingMode(
  mode: RoundingMode | undefined,
): RoundingMode {
  if (mode === undefined) return "truncate";
  if (
    mode === "floor" ||
    mode === "ceil" ||
    mode === "round" ||
    mode === "truncate"
  ) {
    return mode;
  }
  throw new StellarAmountError("INVALID_FORMAT", "Unknown rounding mode.");
}

export function divideRounded(
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode,
): bigint {
  if (denominator === 0n) {
    throw new StellarAmountError("DIVIDE_BY_ZERO", "Cannot divide by zero.");
  }
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder === 0n || mode === "truncate") return quotient;

  const positive = numerator < 0n === denominator < 0n;
  if (mode === "floor") return positive ? quotient : quotient - 1n;
  if (mode === "ceil") return positive ? quotient + 1n : quotient;
  const absRemainder = remainder < 0n ? -remainder : remainder;
  const absDenominator = denominator < 0n ? -denominator : denominator;
  return absRemainder * 2n >= absDenominator
    ? quotient + (positive ? 1n : -1n)
    : quotient;
}

export function decimalToRational(value: string): {
  numerator: bigint;
  scale: bigint;
} {
  if (value.length === 0 || value.trim() !== value) {
    throw new StellarAmountError(
      "INVALID_FORMAT",
      "Expected a decimal string without whitespace.",
    );
  }
  if (value.startsWith("-")) {
    throw new StellarAmountError(
      "NEGATIVE",
      "Negative values are not supported.",
    );
  }
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
    throw new StellarAmountError(
      "INVALID_FORMAT",
      "Expected a non-negative decimal string.",
    );
  }
  const [whole = "0", fraction = ""] = value.split(".");
  return {
    numerator: BigInt((whole || "0") + fraction),
    scale: 10n ** BigInt(fraction.length),
  };
}
