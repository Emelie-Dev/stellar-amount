export type StellarAmountErrorCode =
  | "INVALID_FORMAT"
  | "TOO_MANY_DECIMALS"
  | "NEGATIVE"
  | "OVERFLOW"
  | "DIVIDE_BY_ZERO";

export class StellarAmountError extends Error {
  readonly code: StellarAmountErrorCode;

  constructor(code: StellarAmountErrorCode, message: string) {
    super(message);
    this.name = "StellarAmountError";
    this.code = code;
  }
}
