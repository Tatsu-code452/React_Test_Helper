// extractMockInfo.ts
import type { FileAnalysis } from "../../types/types";

export type MockInfo = {
    importPath: string;
    fnName: string;
    mockName: string;
};

export const extractMockInfo = (imports: FileAnalysis["source"]["imports"]): MockInfo[] => {
    return imports
        .filter(i => i.named.length > 0)
        .filter(i => i.module.startsWith("."))
        .filter(i => !i.module.includes("types") && !i.module.includes("db"))
        .map(i => {
            const fnName = i.named[0]; // useXxx
            const mockName = `${fnName}Mock`;
            return {
                importPath: i.module,
                fnName: fnName as string,
                mockName,
            };
        });
};
