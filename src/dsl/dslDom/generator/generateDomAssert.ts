import { DomState } from "../../model";
import { capitalize } from "../../utils/utils";
import { generateAssertFunction } from "./generateAssertFunction";

export const generateDomAssert = (parsed: DomState[]): {
    assertFiles: Record<string, string>,
    mapLines: string[]
} => {
    const workAssertFiles = new Map<string, string[]>();
    const mapLines: string[] = [];
    for (const state of parsed) {
        const funcName = `assert${capitalize(state.domain)}${capitalize(state.state)}`;
        const key = `${state.domain}:${state.state}`;
        mapLines.push(`  "${key}": ${funcName},`);

        const assertFunc = generateAssertFunction(funcName, state.assertions);

        const fileName = `${state.domain}`;
        if (!workAssertFiles.has(fileName)) {
            workAssertFiles.set(fileName, []);
        }
        workAssertFiles.get(fileName)?.push(assertFunc);
    }

    const imports = `import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { expect } from "vitest";

`;

    const assertFiles: Record<string, string> =
        Object.fromEntries(
            Array.from(workAssertFiles.entries())
                .map(([key, arr]) => [key, `${imports}${arr.join("\n")}`])
        );

    return {
        assertFiles,
        mapLines,
    };
};