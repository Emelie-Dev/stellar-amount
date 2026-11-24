import { describe, expect, it, vi } from "vitest";

// Simulate a genuine programming bug inside the throwing API: it is not a
// validation failure, so tryToStroops must not turn it into a failure result.
vi.mock("../src/convert.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/convert.js")>();
  return {
    ...actual,
    toStroops: () => {
      throw new TypeError("simulated unexpected error");
    },
  };
});

const { tryToStroops } = await import("../src/result.js");

describe("tryToStroops with unexpected errors", () => {
  it("re-throws errors that are not StellarAmountError", () => {
    expect(() => tryToStroops("1")).toThrow(TypeError);
  });

  it("never reports an unexpected error as a failure result", () => {
    let result: unknown;
    try {
      result = tryToStroops("1");
    } catch {
      result = undefined;
    }
    expect(result).toBeUndefined();
  });
});
