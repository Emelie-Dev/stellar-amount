import { MAX_STROOPS, STROOPS_PER_UNIT } from "./constants.js";
import { StellarAmountError } from "./errors.js";
import { parseAmount } from "./parse.js";

export function toStroops(
  amount: string | number | bigint,
  opts?: { rounding?: import("./rounding.js").RoundingMode },
): bigint {
  if (typeof amount === "bigint") {
    if (amount < 0n)
      throw new StellarAmountError(
        "NEGATIVE",
        "Negative values are not supported.",
      );
    const result = amount * STROOPS_PER_UNIT;
    if (result > MAX_STROOPS) {
      throw new StellarAmountError(
        "OVERFLOW",
        "Amount exceeds the int64 stroops limit.",
      );
    }
    return result;
  }
  return parseAmount(amount, opts?.rounding);
}

export function fromStroops(stroops: bigint | string | number): string {
  let value: bigint;
  if (typeof stroops === "bigint") {
    value = stroops;
  } else if (typeof stroops === "number") {
    if (!Number.isSafeInteger(stroops)) {
      throw new StellarAmountError(
        "INVALID_FORMAT",
        "Stroops number must be a safe integer.",
      );
    }
    value = BigInt(stroops);
  } else {
    if (!/^\d+$/.test(stroops)) {
      if (stroops.startsWith("-")) {
        throw new StellarAmountError(
          "NEGATIVE",
          "Negative values are not supported.",
        );
      }
      throw new StellarAmountError(
        "INVALID_FORMAT",
        "Stroops must be an unsigned integer.",
      );
    }
    value = BigInt(stroops);
  }
  if (value < 0n)
    throw new StellarAmountError(
      "NEGATIVE",
      "Negative values are not supported.",
    );
  if (value > MAX_STROOPS)
    throw new StellarAmountError("OVERFLOW", "Stroops exceed the int64 limit.");
  const whole = value / STROOPS_PER_UNIT;
  const fraction = (value % STROOPS_PER_UNIT)
    .toString()
    .padStart(7, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
