import { toStroops } from "./convert.js";
import { StellarAmountError, type StellarAmountErrorCode } from "./errors.js";
import type { RoundingMode } from "./rounding.js";

/** Successful parse: `stroops` is the exact int64-compatible amount. */
export type StellarAmountSuccess = {
  readonly ok: true;
  readonly stroops: bigint;
};

/** Failed parse: carries the stable error code so callers can branch on it. */
export type StellarAmountFailure = {
  readonly ok: false;
  readonly code: StellarAmountErrorCode;
  readonly message: string;
  readonly error: StellarAmountError;
};

export type StellarAmountResult = StellarAmountSuccess | StellarAmountFailure;

/**
 * Parses a decimal amount into stroops without throwing for invalid input.
 *
 * This is the non-throwing counterpart to {@link toStroops}: an invalid amount
 * is reported as `{ ok: false, code, message }` using the same stable error
 * codes, which makes it suitable for form validation where invalid input is an
 * ordinary outcome rather than an exceptional one.
 *
 * Only `StellarAmountError` is converted into a failure result. Anything else
 * (a genuine programming error, a broken custom `toString`, an out-of-memory
 * condition) is re-thrown so it cannot be mistaken for a validation failure and
 * silently swallowed.
 *
 * @example
 * const result = tryToStroops(input);
 * if (result.ok) {
 *   pay(result.stroops);
 * } else if (result.code === "TOO_MANY_DECIMALS") {
 *   showHint("Use at most 7 decimal places.");
 * } else {
 *   setError(result.message);
 * }
 */
export function tryToStroops(
  amount: string | number | bigint,
  opts?: { rounding?: RoundingMode },
): StellarAmountResult {
  try {
    return { ok: true, stroops: toStroops(amount, opts) };
  } catch (error) {
    if (error instanceof StellarAmountError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        error,
      };
    }
    throw error;
  }
}

/**
 * Type guard narrowing a {@link StellarAmountResult} to its success variant.
 *
 * @example
 * if (isSuccess(tryToStroops(input))) {
 *   // `result.stroops` is a bigint here
 * }
 */
export function isSuccess(
  result: StellarAmountResult,
): result is StellarAmountSuccess {
  return result.ok;
}

/**
 * Type guard narrowing a {@link StellarAmountResult} to its failure variant.
 *
 * @example
 * if (isFailure(result)) {
 *   switch (result.code) {
 *     case "NEGATIVE": ...
 *   }
 * }
 */
export function isFailure(
  result: StellarAmountResult,
): result is StellarAmountFailure {
  return !result.ok;
}
