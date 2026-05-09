// template/apiTemplate.ts
export default function apiTemplate({
  name,
  hookPath,
  apiName,
  apiModulePath,
}: {
  name: string;
  hookPath: string;
  apiName: string;
  apiModulePath: string;
}) {
  return `
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { ${name} } from "${hookPath}";

// --- 空の vi.mock ---
vi.mock("${apiModulePath}", () => ({
  ${apiName}: {
    create: vi.fn(),
    update: vi.fn(),
    search: vi.fn(),
  }
}));

// --- モック参照 ---
import { ${apiName} } from "${apiModulePath}";
const apiMock = ${apiName};

describe("${name}", () => {
  let hook;

  beforeEach(() => {
    apiMock.create.mockReset();
    apiMock.update.mockReset();
    apiMock.search.mockReset();

    hook = renderHook(() => ${name}());
  });

  it("should work", () => {
    expect(hook.result.current).toBeDefined();
  });
});
`;
}
