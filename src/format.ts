import { MAX_STROOPS, STROOPS_PER_UNIT } from "./constants.js";
import { StellarAmountError } from "./errors.js";
import {
  divideRounded,
  validateRoundingMode,
  type RoundingMode,
} from "./rounding.js";

export interface FormatOptions {
  locale?: string;
  minDecimals?: number;
  maxDecimals?: number;
  symbol?: string;
  rounding?: RoundingMode;
  groupSeparator?: boolean;
}

export function format(stroops: bigint, opts: FormatOptions = {}): string {
  if (stroops < 0n)
    throw new StellarAmountError(
      "NEGATIVE",
      "Negative values are not supported.",
    );
  if (stroops > MAX_STROOPS)
    throw new StellarAmountError("OVERFLOW", "Stroops exceed the int64 limit.");
  const locale = opts.locale ?? "en-US";
  const minDecimals = opts.minDecimals ?? 0;
  const maxDecimals = opts.maxDecimals ?? 7;
  if (
    !Number.isInteger(minDecimals) ||
    !Number.isInteger(maxDecimals) ||
    minDecimals < 0 ||
    maxDecimals > 7 ||
    minDecimals > maxDecimals
  ) {
    throw new StellarAmountError(
      "INVALID_FORMAT",
      "Decimal limits must satisfy 0 <= minDecimals <= maxDecimals <= 7.",
    );
  }
  const mode = validateRoundingMode(opts.rounding ?? "truncate");
  const scale = 10n ** BigInt(7 - maxDecimals);
  const rounded = divideRounded(stroops, scale, mode) * scale;
  const units = rounded / STROOPS_PER_UNIT;
  const fractionValue = (rounded % STROOPS_PER_UNIT)
    .toString()
    .padStart(7, "0")
    .slice(0, maxDecimals);
  const fraction = fractionValue.replace(/0+$/, "");

  let integerFormatter: Intl.NumberFormat;
  let decimalSeparator: string;
  let digitFormatter: Intl.NumberFormat;
  try {
    integerFormatter = new Intl.NumberFormat(locale, {
      useGrouping: opts.groupSeparator ?? true,
      maximumFractionDigits: 0,
    });
    const decimalParts = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1,
    }).formatToParts(1.1);
    decimalSeparator =
      decimalParts.find((part) => part.type === "decimal")?.value ?? ".";
    digitFormatter = new Intl.NumberFormat(locale, {
      useGrouping: false,
      maximumFractionDigits: 0,
    });
  } catch (error) {
    if (error instanceof RangeError) {
      throw new StellarAmountError("INVALID_FORMAT", "Invalid locale.");
    }
    throw error;
  }
  const localizedDigits = Array.from({ length: 10 }, (_, digit) =>
    digitFormatter.format(BigInt(digit)),
  );
  const localize = (digits: string) =>
    [...digits]
      .map((digit) => localizedDigits[Number(digit)] ?? digit)
      .join("");
  const integer = integerFormatter.format(units);
  const displayedFraction = localize(fraction.padEnd(minDecimals, "0"));
  const result = displayedFraction
    ? `${integer}${decimalSeparator}${displayedFraction}`
    : integer;
  return opts.symbol ? `${result} ${opts.symbol}` : result;
}
