export default function hookTemplate({
	name,
	hookPath,
	mocks,
}: {
	name: string;
	hookPath: string;
	mocks: { importPath: string; fnName: string; mockName: string }[];
}) {
	return `
import { setup } from "./${name}Mock";

import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ${name} } from "${hookPath}";

${mocks.map(
		(m) => `import { ${m.fnName}Mock } from "./mock";`
	).join("\n")
		}

describe("${name}", () => {
  let hook;
  let hookResult: ReturnType<typeof ${name}>;

  beforeEach(() => {
    setup();

    hook = renderHook(() => ${name}());
    hookResult = hook.result.current;
  });

  it("should work", () => {
    expect(hookResult).toBeDefined();
  });
});
`;
}
