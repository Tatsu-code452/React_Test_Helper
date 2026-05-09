const defaultTemplate = (name: string) => `
import { describe, it, expect } from "vitest";

describe("${name}", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
`;

export = defaultTemplate;