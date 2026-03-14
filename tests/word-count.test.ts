import { describe, it, expect } from "vitest";
import { countWords } from "../src/utils/word-count.js";

describe("countWords", () => {
  it("count words in normal sentence", () => {
    expect(countWords("hello world hello world")).toBe(4);
  });

  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("returns 0 for whitespace only", () => {
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("handles extra whitespace between words", () => {
    expect(countWords("  one   two   three  ")).toBe(3);
  });

  it("handles single word", () => {
    expect(countWords("hello")).toBe(1);
  });
});
