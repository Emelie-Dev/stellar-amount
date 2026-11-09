import { MAX_STROOPS, STROOPS_PER_UNIT } from "./constants.js";
import { StellarAmountError } from "./errors.js";
import {
  decimalToRational,
  divideRounded,
  validateRoundingMode,
  type RoundingMode,
} from "./rounding.js";

function expandExponent(value: string): string {
  const match = /^(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(value);
  if (!match) return value;
  const integer = match[1] ?? "";
  const fraction = match[2] ?? "";
  const exponent = Number(match[3]);
  const digits = integer + fraction;
  const decimalPosition = integer.length + exponent;
  if (decimalPosition <= 0) return `0.${"0".repeat(-decimalPosition)}${digits}`;
  if (decimalPosition >= digits.length)
    return digits + "0".repeat(decimalPosition - digits.length);
  return `${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
}

export function decimalInput(value: string | number): string {
  if (typeof value === "string") return value;
  if (!Number.isFinite(value)) {
    throw new StellarAmountError(
      "INVALID_FORMAT",
      "Number input must be finite.",
    );
  }
  return expandExponent(String(value));
}

export function parseAmount(
  value: string | number,
  rounding?: RoundingMode,
): bigint {
  const text = decimalInput(value);
  const { numerator, scale } = decimalToRational(text);
  const fractionLength = text.split(".")[1]?.length ?? 0;
  if (fractionLength > 7 && rounding === undefined) {
    throw new StellarAmountError(
      "TOO_MANY_DECIMALS",
      "Amounts may have at most 7 decimal places.",
    );
  }
  const mode = validateRoundingMode(rounding);
  const result = divideRounded(numerator * STROOPS_PER_UNIT, scale, mode);
  if (result > MAX_STROOPS) {
    throw new StellarAmountError(
      "OVERFLOW",
      "Amount exceeds the int64 stroops limit.",
    );
  }
  return result;
}

export function isValidAmount(value: string): boolean {
  try {
    parseAmount(value);
    return true;
  } catch (error) {
    if (error instanceof StellarAmountError) return false;
    throw error;
  }
}

export function assertValidAmount(value: string): asserts value is string {
  parseAmount(value);
}
