# stellar-amount

[![CI](https://github.com/determined-001/stellar-amount/actions/workflows/ci.yml/badge.svg)](https://github.com/determined-001/stellar-amount/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/stellar-amount.svg)](https://www.npmjs.com/package/stellar-amount)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Exact Stellar amount parsing, conversion, arithmetic, and formatting with `BigInt` and no runtime dependencies. Stellar stores amounts in stroops (1 XLM = 10,000,000 stroops); JavaScript floating-point math can turn `0.1 + 0.2` into `0.30000000000000004`, which is not an acceptable foundation for money.

## Install

```sh
npm install stellar-amount
```

Node.js 18 or newer is required. The package provides ESM, CommonJS, and TypeScript declarations.

## Quick start

```ts
import { toStroops, fromStroops, add, format } from "stellar-amount";

const payment = toStroops("12.3456789"); // 123456789n
const total = add(payment, toStroops("0.1"));
fromStroops(total); // "12.4456789"
format(total, { symbol: "XLM" }); // "12.4456789 XLM"
```

Always pass money as decimal strings. `number` is supported for convenience via its shortest decimal representation; exponential notation is expanded exactly where possible, but precision already lost before this library receives a number cannot be recovered. `bigint` passed to `toStroops` denotes a whole-unit amount. Factors and divisors are non-negative decimal strings.

## API

### Constants and errors

- `STROOPS_PER_UNIT`: `10_000_000n`
- `MAX_STROOPS`: `9_223_372_036_854_775_807n`, the maximum signed 64-bit stroop value
- `StellarAmountError`: error type with stable `code` property

### Conversion and validation

```ts
toStroops(amount: string | number | bigint, opts?: { rounding?: RoundingMode }): bigint
fromStroops(stroops: bigint | string | number): string
isValidAmount(amount: string): boolean
assertValidAmount(amount: string): asserts amount is string
```

`toStroops("1.2")` returns `12000000n`; with `toStroops("1.23456789", { rounding: "round" })`, excess decimal places are rounded to the nearest stroop. Strings reject whitespace, signs, invalid characters, and more than seven fractional digits unless a rounding mode is supplied. Accepted forms include `"1"`, `"1."`, `".5"`, and `"0.0000001"`. `fromStroops` accepts only non-negative integer stroops and produces canonical unit text without trailing zeros.

### Arithmetic

Every arithmetic function accepts and returns stroops as `bigint`.

```ts
add(a, b)
sub(a, b)
mul(a, factor: string, opts?)
div(a, divisor: string, opts?)
percent(a, pct: string, opts?)
compare(a, b) // -1 | 0 | 1
min(...values)
max(...values)
```

For example, `mul(toStroops("10"), "1.5")` returns `150000000n`; `percent(toStroops("200"), "2.5")` returns the stroops equivalent of `5` units. Division by zero, negative results, and values above `MAX_STROOPS` throw.

### Rounding

Rounding modes apply to conversion with excess precision, multiplication, division, percentages, and formatting.

| Mode       | Behavior                                     |
| ---------- | -------------------------------------------- |
| `truncate` | Discard remainder toward zero (default)      |
| `floor`    | Round toward negative infinity               |
| `ceil`     | Round toward positive infinity               |
| `round`    | Nearest integer; exact halves away from zero |

Inputs and results are non-negative, so `floor` and `truncate` are equivalent for this library's operations.

### Formatting

```ts
format(stroops, {
  locale: "en-US", // default
  minDecimals: 0, // default
  maxDecimals: 7, // default
  symbol: "XLM", // appended with a space
  rounding: "truncate", // default
  groupSeparator: true, // default
});
```

Formatting examples:

```ts
format(toStroops("1234.5"), { locale: "en-US" }); // "1,234.5"
format(toStroops("1234.5"), { locale: "de-DE" }); // "1.234,5"
format(toStroops("1234.5"), { locale: "fr-FR" }); // "1 234,5"
format(toStroops("1234.5"), { locale: "en-NG" }); // "1,234.5"
format(toStroops("1234.5"), { symbol: "XLM" }); // "1,234.5 XLM"
```

Grouping and decimal separators are locale-aware; all amount digits are assembled from integer math, not floating-point amount formatting.

### Error codes

| Code                | Meaning                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `INVALID_FORMAT`    | Invalid decimal, stroop input, option, or empty extrema input       |
| `TOO_MANY_DECIMALS` | More than seven fractional digits without an explicit rounding mode |
| `NEGATIVE`          | Negative input or result                                            |
| `OVERFLOW`          | Amount exceeds the signed int64 stroop maximum                      |
| `DIVIDE_BY_ZERO`    | Zero divisor                                                        |

## Why not `Number` or `BigNumber.js`?

`Number` uses binary floating point and cannot exactly represent many decimal fractions. This library keeps values as `BigInt` throughout and parses decimal text explicitly. Unlike a general-purpose decimal library such as BigNumber.js, it is focused on Stellar's seven-decimal precision and signed 64-bit stroop bound, with zero runtime dependencies.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, scripts, and contribution guidelines.

## License

MIT © determined-001. See [LICENSE](LICENSE).
