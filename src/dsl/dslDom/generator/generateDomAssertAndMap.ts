import { DomState } from "../../model";
import { capitalize } from "../../utils/utils";
import { generateAssertFunction } from "./generateAssertFunction";

export const generateDomAssertAndMap = (parsed: DomState[]) => {
    const assertFiles: Record<string, string> = {};
    const mapLines: string[] = [];

    for (const state of parsed) {
        const funcName = `assert${capitalize(state.domain)}${capitalize(state.state)}`;
        const assertCode = generateAssertFunction(funcName, state.assertions);

        const fileName = `${state.domain}`;
        const key = `${state.domain}:${state.state}`;
        mapLines.push(`  "${key}": ${funcName},`);

        assertFiles[fileName] = assertFiles[fileName] ? `${assertFiles[fileName]}\n ${assertCode}` : assertCode;
    }

    const domStateMap = `
export const domStateMap = {
${mapLines.join("\n")}
};
`.trim();

    return {
        assertFiles,
        domStateMap,
    };
};
